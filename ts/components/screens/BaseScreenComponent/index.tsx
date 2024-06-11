import React, { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { ColorValue, View } from "react-native";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { TranslationKeys } from "../../../../locales/locales";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import { currentRouteSelector } from "../../../store/reducers/navigation";
import { FAQsCategoriesType } from "../../../utils/faq";
import {
  assistanceToolRemoteConfig,
  resetCustomFields
} from "../../../utils/supportAssistance";
import { SearchType } from "../../search/SearchButton";
import { AccessibilityEvents, BaseHeader } from "../BaseHeader";

export type ContextualHelpProps = {
  title: string;
  body: () => React.ReactNode;
};

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};

interface OwnProps {
  onAccessibilityNavigationHeaderFocus?: () => void;
  accessibilityEvents?: AccessibilityEvents;
  accessibilityLabel?: string;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  headerBody?: React.ReactNode;
  headerBackgroundColor?: ColorValue;
  hideBaseHeader?: boolean;
  appLogo?: boolean;
  searchType?: SearchType;
  backButtonTestID?: string;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  hideHelpButton?: boolean;
}

export type Props = PropsWithChildren<
  OwnProps & ComponentProps<typeof BaseHeader>
>;

/**
 * @deprecated In the legacy screens, BaseScreenComponent was used to include the header
 * in the screen component. To properly configure the header through the `react-navigation`
 * library, please use `useHeaderSecondLevel` and configure the navigator with `headerShown`
 * set to `true`. If in doubt, please ask for help or read the available documentation.
 */
const BaseScreenComponent = React.forwardRef<ReactNode, Props>(
  (props: Props, _) => {
    const {
      accessibilityEvents,
      accessibilityLabel,
      appLogo,
      backButtonTestID,
      children,
      contextualHelp,
      contextualHelpMarkdown,
      customGoBack,
      customRightIcon,
      dark,
      hideHelpButton,
      faqCategories,
      goBack,
      hideBaseHeader = false,
      headerBackgroundColor,
      headerBody,
      headerTitle,
      isSearchAvailable,
      onAccessibilityNavigationHeaderFocus,
      primary,
      showChat,
      titleColor,
      hideSafeArea
    } = props;

    /**
     *  We have to use the deprecated currentRouteSelector because, at the moment, some BaseScreenComponent
     *  are outside the navigation context.
     *  TODO: Full usage of navigation header and modal, in order to have always the right context
     *
     */
    const currentScreenName = useIOSelector(currentRouteSelector);

    const dispatch = useIODispatch();
    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const canShowHelp = useIOSelector(canShowHelpSelector);
    const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

    const onShowHelp = (): (() => void) | undefined => {
      switch (choosenTool) {
        case ToolEnum.zendesk:
          // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
          return () => {
            resetCustomFields();
            dispatch(
              zendeskSupportStart({
                faqCategories,
                contextualHelp,
                contextualHelpMarkdown,
                startingRoute: currentScreenName,
                assistanceForPayment: false,
                assistanceForCard: false,
                assistanceForFci: false
              })
            );
          };
        case ToolEnum.instabug:
        case ToolEnum.web:
        case ToolEnum.none:
          return undefined;
      }
    };

    const canShowHelpButton = () => {
      if (hideHelpButton) {
        return false;
      } else {
        return canShowHelp && (contextualHelp || contextualHelpMarkdown);
      }
    };

    return (
      <View style={{ flexGrow: 1 }}>
        {!hideBaseHeader && (
          <BaseHeader
            hideSafeArea={hideSafeArea}
            onAccessibilityNavigationHeaderFocus={
              onAccessibilityNavigationHeaderFocus
            }
            backButtonTestID={backButtonTestID}
            accessibilityEvents={accessibilityEvents}
            accessibilityLabel={accessibilityLabel}
            showChat={showChat}
            primary={primary}
            dark={dark}
            goBack={goBack}
            headerTitle={headerTitle}
            backgroundColor={headerBackgroundColor}
            onShowHelp={canShowHelpButton() ? onShowHelp() : undefined}
            isSearchAvailable={isSearchAvailable}
            body={headerBody}
            appLogo={appLogo}
            customRightIcon={customRightIcon}
            customGoBack={customGoBack}
            titleColor={titleColor}
          />
        )}
        {children}
      </View>
    );
  }
);

export default BaseScreenComponent;
