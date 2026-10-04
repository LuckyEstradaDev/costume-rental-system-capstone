import {createContext, useContext, useState} from "react";
import {IOrder} from "../../buy/types/IOrder";
import {PaymentDetailsPanelValues} from "../components/PaymentDetailsPanel";
import {IRent} from "../../rent/types/IRent";

interface IPaymentContext {
  order: IOrder | IRent | null;
  setOrder: (order: IOrder | IRent | null) => void;
  cardDetails: PaymentDetailsPanelValues;
  setCardDetails: React.Dispatch<
    React.SetStateAction<PaymentDetailsPanelValues>
  >;
}

const PaymentContext = createContext<IPaymentContext | null>(null);

export const usePayment = () => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePayment must be used inside PaymentProvider");
  return ctx;
};

export const PaymentProvider = ({children}: {children: React.ReactNode}) => {
  const [order, setOrder] = useState<IOrder | IRent | null>(null);
  const [cardDetails, setCardDetails] = useState<PaymentDetailsPanelValues>({
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
  });

  return (
    <PaymentContext.Provider
      value={{
        order,
        setOrder,
        cardDetails,
        setCardDetails,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
