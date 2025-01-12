import { useEffect, useState } from "react";
import "../Css/Payment.css";
import { Row, Container, Col } from "react-bootstrap";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { API_URL } from "../App";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { useUser } from "../Component/UserContext";
import ModelAlert from "../Component/ModelAlert";

function Payment() {
  const { userId } = useUser();
  const { reservation_id } = useParams();
  const lang = location.pathname.split("/")[1] || "en";
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const initial_amount = queryParams.get("initial_amount");
  const total_amount = queryParams.get("total_amount");
  const [selectedPayment, setSelectedPayment] = useState("credit_card");
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [name, setName] = useState("");
  const [final_price_pay, setFinal_price_pay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const handlePaymentTypeChange = (paymentType) => {
    setSelectedPayment(paymentType);
  };
  const stripe = useStripe();
  const elements = useElements();
  // eslint-disable-next-line no-unused-vars
  const [errorMessage, setErrorMessage] = useState(null);
useEffect(()=>{
window.scrollTo(0,0);
},[])
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (elements == null) {
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      return;
    }
    let amount;
    if (final_price_pay === "initial_amount") {
      amount = initial_amount; 
    } else {
      amount = total_amount; 
    }
    // Create the PaymentIntent and obtain clientSecret from your server endpoint
    const res = await fetch(`${API_URL}/payments/createPaymentIntent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({ amount, phoneNumber }), 
    });

    const { clientSecret } = await res.json(); 
    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      clientSecret,
      confirmParams: {
        return_url: `https://rowqan.com`,
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    let status;
    if (selectedPayment === "cliq") {
      status = "Pending";
    } else {
      status = "Confirmed";
    }
    try {
      await axios.post(`${API_URL}/payments/createPayment`, {
        user_id: userId || null,
        reservation_id: reservation_id,
        status,
        paymentMethod: selectedPayment,
        "Phone_Number":phoneNumber,
        "UserName":name,
      });
      setModalTitle("Success");
      setModalMessage("Payment Added successfully!");
      setShowModal(true);
      setTimeout(() => navigate(`/${lang}`), 2500);
    } catch (error) {
      console.error("Error confirming Payment:", error);
    }
  };
  return (
    <div>
      <article className="card_cont">
        <div className="container main_cont_payment">
          <div className="card-title mb-5">
            <h2>Payment</h2>
            <h5>Initial Amount:{initial_amount}</h5>
            <h5>Total Amount:{total_amount}</h5>
          </div>
          <div className="card-body">
            <div className="payment-type">
              <Container>
                <h4>Choose payment method below</h4>
                <div className="types flex_display justify-space-between">
                  <Row>
                    {/* Credit Card */}
                    <Col sm={12} md={4} lg={4} className="mb-2">
                      <div
                        className={`type ${
                          selectedPayment === "credit_card" ? "selected" : ""
                        }`}
                        onClick={() => handlePaymentTypeChange("credit_card")}
                      >
                        <div className="logo_payment">
                          <i className="far fa-credit-card"></i>
                        </div>
                        <div className="text">
                          <p className="para_payment">Pay with Credit Card</p>
                        </div>
                      </div>
                    </Col>
                    {/* PayPal */}
                    <Col sm={12} md={4} lg={4} className="mb-2">
                      <div
                        className={`type ${
                          selectedPayment === "cliq" ? "selected" : ""
                        }`}
                        onClick={() => handlePaymentTypeChange("cliq")}
                      >
                        <div className="logo">
                          <i className="fab fa-paypal"></i>
                        </div>
                        <div className="text">
                          <p className="para_payment">Pay with Cliq</p>
                        </div>
                      </div>
                    </Col>
                    {/* Amazon */}
                    <Col sm={12} md={4} lg={4}>
                      <div
                        className={`type ${
                          selectedPayment === "cash" ? "selected" : ""
                        }`}
                        onClick={() => handlePaymentTypeChange("cash")}
                      >
                        <div className="logo">
                          <i className="fab fa-amazon"></i>
                        </div>
                        <div className="text">
                          <p className="para_payment">Pay with Cash</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Container>
            </div>

            {/* Conditionally render payment details based on the selected method */}
            <div className="payment-info row">
              {/* Credit Card Info */}
              {selectedPayment === "credit_card" && (
                <div className="col-12 col-md-6">
                  <form onSubmit={handleSubmit}>
                    <label className="label_of_payment">Phone Number</label>

                    <input
                      className="input_payment"
                      type="number"
                      required
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                      }}
                    />
                    <Form.Select
                      aria-label="Default select example"
                      className="my-2"
                      onChange={(e) => setFinal_price_pay(e.target.value)}
                    >
                      <option>Choose Total Payment</option>
                      <option value="initial_amount">Initial amount</option>
                      <option value="total_amount">Total amount</option>
                    </Form.Select>
                    <PaymentElement />
                    <div className="col-auto text-center mt-2">
                      <button
                        disabled={!stripe}
                        className="button button-primary btn_payment "
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PayPal Info */}
              {selectedPayment === "cliq" && (
                <div className="col-12 col-md-6">
                  <h4>Pay with Cliq</h4>
                  <p>
                    To confirm your reservation, please send the total amount
                    via Cliq to the following phone number (0781234678),
                    Afterward, share the payment details via WhatsApp to
                    finalize and confirm your reservation then click submit.
                  </p>
                  <form  onSubmit={handleConfirmPayment}                  >
                    <label className="label_of_payment">Name</label>
                    <input
                      className="input_payment"
                      type="text"
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                    <label className="label_of_payment">Phone Number</label>
                    <input
                      className="input_payment"
                      type="number"
                      required
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                      }}
                    />
                    <div className="col-auto text-center mt-2">
                    <button
                      className="button button-primary btn_payment "
                    >
                      Submit
                    </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Amazon Info */}
              {selectedPayment === "cash" && (
                <div className="col-12 col-md-6">
                  <h4>Pay with Cash</h4>
                  <p>
                  Please click on Submit to complete and confirm your reservation.
                  </p>
                  <form  onSubmit={handleConfirmPayment}                  >
                    <label className="label_of_payment">Name</label>
                    <input
                      className="input_payment"
                      type="text"
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                    <label className="label_of_payment">Phone Number</label>
                    <input
                      className="input_payment"
                      type="number"
                      required
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                      }}
                    />
                    <div className="col-auto text-center mt-2">
                    <button
                      className="button button-primary btn_payment "
                    >
                      Submit
                    </button>
                    </div>
                  </form>
                           </div>
              )}
            </div>
          </div>
        </div>
      </article>
      <ModelAlert
        show={showModal}
        handleClose={() => setShowModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}

export default Payment;
