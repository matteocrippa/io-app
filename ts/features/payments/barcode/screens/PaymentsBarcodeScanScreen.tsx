import { IOToast } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { paymentInitializeState } from "../../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { barcodesScannerConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import {
  BarcodeFailure,
  BarcodeScanBaseScreenComponent,
  IOBarcode,
  useIOBarcodeFileReader
} from "../../../barcode";
import * as analytics from "../../../barcode/analytics";
import {
  IOBarcodeFormat,
  IOBarcodeOrigin,
  IOBarcodeType,
  IO_BARCODE_ALL_FORMATS,
  PagoPaBarcode
} from "../../../barcode/types/IOBarcode";
import { usePagoPaPayment } from "../../checkout/hooks/usePagoPaPayment";
import { PaymentsCheckoutRoutes } from "../../checkout/navigation/routes";
import { PaymentsBarcodeRoutes } from "../navigation/routes";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};

const PaymentsBarcodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const { dataMatrixPosteEnabled } = useIOSelector(
    barcodesScannerConfigSelector
  );
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const { startPaymentFlowWithRptId, isNewWalletSectionEnabled } =
    usePagoPaPayment();

  const barcodeFormats: Array<IOBarcodeFormat> = IO_BARCODE_ALL_FORMATS.filter(
    format => (format === "DATA_MATRIX" ? dataMatrixPosteEnabled : true)
  );

  const barcodeTypes: Array<IOBarcodeType> = ["PAGOPA"];

  const handleBarcodeSuccess = (
    barcodes: Array<IOBarcode>,
    origin: IOBarcodeOrigin
  ) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess);

    analytics.trackBarcodeScanSuccess("avviso", barcodes[0], origin);

    const pagoPaBarcodes: Array<PagoPaBarcode> = pipe(
      barcodes,
      A.filter(barcode => barcode.type === "PAGOPA"),
      A.map(barcode => barcode as PagoPaBarcode)
    );

    const hasDataMatrix = pagoPaBarcodes.some(
      barcode => barcode.format === "DATA_MATRIX"
    );

    if (hasDataMatrix) {
      void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
    }

    if (pagoPaBarcodes.length > 1) {
      navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
        screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE,
        params: {
          barcodes: pagoPaBarcodes
        }
      });
      return;
    }

    const barcode = pagoPaBarcodes[0];

    if (barcode.type === "PAGOPA") {
      if (isNewWalletSectionEnabled) {
        startPaymentFlowWithRptId(barcode.rptId, {
          onSuccess: "showTransaction",
          startOrigin:
            barcode.format === "DATA_MATRIX"
              ? "poste_datamatrix_scan"
              : "qrcode_scan"
        });
      } else {
        dispatch(paymentInitializeState());
        switch (barcode.format) {
          case "QR_CODE":
            navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
              screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
              params: {
                initialAmount: barcode.amount,
                rptId: barcode.rptId,
                paymentStartOrigin: "qrcode_scan"
              }
            });
            break;
          case "DATA_MATRIX":
            void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
            navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
              screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
              params: {
                initialAmount: barcode.amount,
                rptId: barcode.rptId,
                paymentStartOrigin: "poste_datamatrix_scan"
              }
            });

            break;
        }
      }
    }
  };

  const handleBarcodeError = (failure: BarcodeFailure) => {
    IOToast.error(I18n.t("barcodeScan.error"));
    if (
      failure.reason === "UNKNOWN_CONTENT" &&
      failure.format === "DATA_MATRIX"
    ) {
      void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_FAILURE");
    }
    analytics.trackBarcodeScanFailure("avviso", failure);
  };

  const handleManualInputPressed = () => {
    analytics.trackBarcodeManualEntryPath("avviso");

    if (isDesignSystemEnabled || isNewWalletSectionEnabled) {
      navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER
      });
    } else {
      navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
        screen: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
        params: {}
      });
    }
  };

  const {
    showFilePicker,
    filePickerBottomSheet,
    isLoading: isFileReaderLoading,
    isFilePickerVisible
  } = useIOBarcodeFileReader({
    barcodeFormats,
    barcodeTypes,
    onBarcodeSuccess: handleBarcodeSuccess,
    onBarcodeError: handleBarcodeError,
    barcodeAnalyticsFlow: "avviso"
  });

  return (
    <>
      <BarcodeScanBaseScreenComponent
        barcodeFormats={barcodeFormats}
        barcodeTypes={barcodeTypes}
        onBarcodeSuccess={handleBarcodeSuccess}
        onBarcodeError={handleBarcodeError}
        onFileInputPressed={showFilePicker}
        onManualInputPressed={handleManualInputPressed}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet"]}
        barcodeAnalyticsFlow="avviso"
        isDisabled={isFilePickerVisible || isFileReaderLoading}
        isLoading={isFileReaderLoading}
      />
      {filePickerBottomSheet}
    </>
  );
};

export { PaymentsBarcodeScanScreen };
