import {
  FooterWithButtons,
  H6,
  HSpacer,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useContext } from "react";
import { Image, StyleSheet, View } from "react-native";
import doubtImage from "../../../../../img/features/euCovidCert/certificate_not_found.png";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { euCovidCertificateUrl } from "../../../../urls";
import { openWebUrl } from "../../../../utils/url";
import { EUCovidContext } from "../../components/EUCovidContext";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  shrink: {
    flexShrink: 1
  }
});

const CopyWithTitleItem: React.FC<{
  title: string;
  toCopy: string;
  testId?: string;
}> = ({ title, toCopy, testId }) => (
  <>
    <View>
      <H6>{title}</H6>
    </View>
    <View style={styles.row}>
      <H6 testID={`${testId}ToCopy`} style={styles.shrink}>
        {toCopy}
      </H6>
      <HSpacer size={16} />
      <CopyButtonComponent textToCopy={toCopy} />
    </View>
  </>
);

const EuCovidCertNotFoundKoComponent: React.FC<{
  currentAuthCode: EUCovidCertificateAuthCode;
  messageId: string;
}> = ({ currentAuthCode, messageId }) => (
  <>
    <InfoScreenComponent
      image={
        <Image
          accessibilityIgnoresInvertColors
          source={doubtImage}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          style={{ width: 104, height: 104, resizeMode: "contain" }}
          testID={"doubtImage"}
        />
      }
      title={I18n.t("features.euCovidCertificate.ko.notFound.title")}
    />
    <H6>{I18n.t("features.euCovidCertificate.ko.notFound.subtitle")}</H6>
    <VSpacer size={16} />
    <CopyWithTitleItem
      title={I18n.t("features.euCovidCertificate.common.authorizationCode")}
      toCopy={currentAuthCode}
      testId={"authorizationCode"}
    />
    <VSpacer size={16} />
    <CopyWithTitleItem
      title={I18n.t("features.euCovidCertificate.common.messageIdentifier")}
      toCopy={messageId}
      testId={"messageIdentifier"}
    />
  </>
);

export const EuCovidCertNotFoundKoScreen = (): React.ReactElement => {
  const euCovidCertCurrent = useContext(EUCovidContext);
  // Handling unexpected error
  if (euCovidCertCurrent === null) {
    void mixpanelTrack("EUCOVIDCERT_UNEXPECTED_ERROR");
    return <WorkunitGenericFailure />;
  }

  return (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertNotFoundKoScreen"}
      content={
        <EuCovidCertNotFoundKoComponent
          currentAuthCode={euCovidCertCurrent.authCode}
          messageId={euCovidCertCurrent.messageId}
        />
      }
      footer={
        <FooterWithButtons
          type={"SingleButton"}
          primary={{
            type: "Solid",
            buttonProps: {
              onPress: () => openWebUrl(euCovidCertificateUrl),
              label: I18n.t("features.euCovidCertificate.ko.notFound.cta")
            }
          }}
        />
      }
    />
  );
};
