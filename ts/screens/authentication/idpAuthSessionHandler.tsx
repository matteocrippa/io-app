/* eslint-disable import/order */
import {
  LoginUtilsError,
  Error as LoginUtilsErrorType,
  openAuthenticationSession
} from "@pagopa/io-react-native-login-utils";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, SafeAreaView, StyleSheet, View } from "react-native";
import { H3 } from "../../components/core/typography/H3";
import I18n from "../../i18n";
import { mixpanelTrack } from "../../mixpanel";

import {
  Body,
  ButtonSolid,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { IdpData } from "../../../definitions/content/IdpData";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import { lollipopKeyTagSelector } from "../../features/lollipop/store/reducers/lollipop";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../features/lollipop/utils/login";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import NavigationService from "../../navigation/NavigationService";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import {
  disableNativeAuthentication,
  loginFailure,
  loginSuccess
} from "../../store/actions/authentication";
import { useIODispatch, useIOSelector, useIOStore } from "../../store/hooks";
import { selectedIdentityProviderSelector } from "../../store/reducers/authentication";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus/remoteConfig";
import { idpContextualHelpDataFromIdSelector } from "../../store/reducers/content";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import themeVariables from "../../theme/variables";
import { SessionToken } from "../../types/SessionToken";
import { trackLollipopIdpLoginFailure } from "../../utils/analytics";
import {
  extractLoginResult,
  getEitherLoginResult,
  getIdpLoginUri
} from "../../utils/login";
import { getSpidErrorCodeDescription } from "../../utils/spidErrorCode";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 56
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

type RequestInfoPositiveStates = {
  requestState: "LOADING" | "AUTHORIZED" | "AUTHORIZING";
  nativeAttempts: number;
};

type RequestInfoError = {
  requestState: "ERROR";
  errorType: ErrorType;
  errorCodeOrMessage?: string;
  nativeAttempts: number;
};

type RequestInfo = RequestInfoPositiveStates | RequestInfoError;

const isBackButtonEnabled = (requestInfo: RequestInfo): boolean =>
  requestInfo.requestState === "AUTHORIZING" ||
  requestInfo.requestState === "ERROR";

const onBack = () =>
  NavigationService.dispatchNavigationAction(CommonActions.goBack());

const idpAuthSession = (
  loginUri: string
): TE.TaskEither<LoginUtilsError, string> =>
  pipe(loginUri, () =>
    TE.tryCatch(
      () => openAuthenticationSession(loginUri, "iologin"),
      error => error as LoginUtilsError
    )
  );

// This page is used in the native login process.
export const AuthSessionPage = () => {
  const [requestInfo, setRequestInfo] = useState<RequestInfo>({
    requestState: "LOADING",
    nativeAttempts: 0
  });

  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

  // This is a handler for the browser login. It applies to android only.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState === "background") {
        setRequestInfo({
          requestState: "AUTHORIZING",
          nativeAttempts: requestInfo.nativeAttempts
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [requestInfo.nativeAttempts]);

  const dispatch = useIODispatch();

  // We call useIOStore beacause we only need some values from store, we don't need any re-render logic
  const store = useIOStore();

  // Memoized values/func --start--
  const state = useMemo(() => store.getState(), [store]);

  const isFastLogin = useMemo(() => isFastLoginEnabledSelector(state), [state]);

  const selectedIdp = useMemo(
    () => selectedIdentityProviderSelector(state),
    [state]
  );

  const idp = useMemo(
    () => selectedIdp?.id as keyof IdpData | undefined,
    [selectedIdp?.id]
  );

  const selectedIdpTextData = useMemo(
    () => idpContextualHelpDataFromIdSelector(idp)(state),
    [idp, state]
  );

  const assistanceToolConfig = useMemo(
    () => assistanceToolConfigSelector(state),
    [state]
  );

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const loginUri = useMemo(
    () => (idp ? getIdpLoginUri(idp, 2) : undefined),
    [idp]
  );

  const maybeKeyTag = useMemo(() => lollipopKeyTagSelector(state), [state]);

  const contextualHelp = useMemo(() => {
    if (O.isNone(selectedIdpTextData)) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: I18n.t("authentication.idp_login.contextualHelpContent")
      };
    }
    return emptyContextualHelp;
  }, [selectedIdpTextData]);

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      dispatch(
        loginFailure({
          error: new Error(
            `login failure with code ${code || message || "n/a"}`
          ),
          idp
        })
      );
      const logText = pipe(
        O.fromNullable(code || message),
        O.fold(
          () => "login failed with no error code or message available",
          _ => {
            if (code) {
              return `login failed with code (${code}) : ${getSpidErrorCodeDescription(
                code
              )}`;
            }
            return `login failed with message ${message}`;
          }
        )
      );

      handleSendAssistanceLog(choosenTool, logText);
      setRequestInfo({
        requestState: "ERROR",
        errorType: ErrorType.LOGIN_ERROR,
        errorCodeOrMessage: code || message,
        nativeAttempts: requestInfo.nativeAttempts
      });
    },
    [choosenTool, dispatch, idp, requestInfo.nativeAttempts]
  );

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      setRequestInfo({
        requestState: "AUTHORIZED",
        nativeAttempts: requestInfo.nativeAttempts
      });
      handleSendAssistanceLog(choosenTool, `login success`);
      return idp
        ? dispatch(loginSuccess({ token, idp }))
        : handleLoginFailure("n/a");
    },
    [choosenTool, dispatch, handleLoginFailure, idp, requestInfo.nativeAttempts]
  );
  // This function is executed when the native component resolve with an error or when loginUri is undefined.
  // About the first case, unless there is a problem with the phone crashing for other reasons, this is very unlikely to happen.
  const handleLoadingError = useCallback(
    (error?: LoginUtilsError) => {
      void mixpanelTrack("SPID_ERROR", {
        idp,
        description: error?.userInfo?.error,
        errorType: ErrorType.LOADING_ERROR
      });

      const backPressed: LoginUtilsErrorType = "NativeAuthSessionClosed";
      if (error?.userInfo?.error === backPressed) {
        onBack();
        return;
      }

      // If native login component fails 3 times, it returns to idp selection screen and tries to login with WebView.
      if (requestInfo.nativeAttempts > 1) {
        dispatch(disableNativeAuthentication());
        onBack();
        return;
      }

      setRequestInfo({
        requestState: "ERROR",
        errorType: ErrorType.LOADING_ERROR,
        nativeAttempts: requestInfo.nativeAttempts
      });
    },
    [dispatch, idp, requestInfo.nativeAttempts]
  );

  // Memoized values/func --end--

  if (
    loginUri &&
    O.isSome(maybeKeyTag) &&
    requestInfo.requestState === "LOADING"
  ) {
    void pipe(
      () =>
        regenerateKeyGetRedirectsAndVerifySaml(
          loginUri,
          maybeKeyTag.value,
          mixpanelEnabled,
          isFastLogin,
          dispatch
        ),
      TE.fold(
        () =>
          T.of(
            setRequestInfo({
              requestState: "ERROR",
              errorType: ErrorType.LOGIN_ERROR,
              nativeAttempts: requestInfo.nativeAttempts
            })
          ),
        url =>
          pipe(
            url,
            () => idpAuthSession(url),
            TE.fold(
              error => T.of(handleLoadingError(error)),
              response =>
                T.of(
                  pipe(
                    extractLoginResult(response),
                    O.fromNullable,
                    O.fold(
                      () => handleLoginFailure(),
                      result =>
                        pipe(
                          result,
                          getEitherLoginResult,
                          E.fold(
                            e =>
                              handleLoginFailure(e.errorCode, e.errorMessage),
                            success => handleLoginSuccess(success.token)
                          )
                        )
                    )
                  )
                )
            )
          )
      )
    )();
  } else if (!loginUri) {
    handleLoadingError();
  } else if (O.isNone(maybeKeyTag)) {
    setRequestInfo({
      requestState: "ERROR",
      errorType: ErrorType.LOGIN_ERROR,
      nativeAttempts: requestInfo.nativeAttempts
    });
    trackLollipopIdpLoginFailure(
      "Missing keyTag while trying to login with lollipop"
    );
  }

  useHardwareBackButton(() => {
    if (isBackButtonEnabled(requestInfo)) {
      return true;
    }
    return false;
  });

  const navigation = useIONavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        gestureEnabled: isBackButtonEnabled(requestInfo)
      });
    }, [navigation, requestInfo])
  );
  useHeaderSecondLevel({
    title: `${I18n.t("authentication.idp_login.headerTitle")} - ${
      selectedIdp?.name
    }`,
    supportRequest: true,
    contextualHelp,
    faqCategories: ["authentication_SPID"],
    canGoBack: isBackButtonEnabled(requestInfo)
  });
  // It is enough to set the status to loading,
  // the reload will ensure that the functions necessary for correct functioning are performed.
  const onRetry = () =>
    setRequestInfo({
      requestState: "LOADING",
      nativeAttempts: requestInfo.nativeAttempts + 1
    });

  if (requestInfo.requestState === "ERROR") {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: requestInfo.errorCodeOrMessage,
        authMethod: "SPID",
        authLevel: "L2",
        onRetry
      }
    });
  }
  if (requestInfo.requestState === "AUTHORIZED") {
    return <IdpSuccessfulAuthentication />;
  } else {
    return (
      <LoadingSpinnerOverlay isLoading={requestInfo.requestState === "LOADING"}>
        {requestInfo.requestState === "AUTHORIZING" && (
          <SafeAreaView style={IOStyles.flex}>
            <View style={styles.errorContainer}>
              <Pictogram name={"processing"} size={120} />
              <VSpacer size={16} />
              <H3 style={styles.title}>{I18n.t("spid.pending_login.title")}</H3>
              <VSpacer size={16} />
              <Body>{I18n.t("spid.pending_login.details")}</Body>
            </View>
            <View style={styles.buttonContainer}>
              <ButtonSolid
                fullWidth
                label={I18n.t("spid.pending_login.button")}
                accessibilityLabel={I18n.t("spid.pending_login.button")}
                onPress={onBack}
              />
            </View>
          </SafeAreaView>
        )}
      </LoadingSpinnerOverlay>
    );
  }
};
