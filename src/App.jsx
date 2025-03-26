/*
https://docs.worldpay.com/apis/wpg/clientsideencryption/javascript-integration

https://developer.worldpay.com/products/access/checkout/web/integration-react

https://developer.worldpay.com/products/access/payments/openapi/other/payment

https://chatgpt.com/share/67e1981b-2b1c-8012-a8e6-b610d713f38e


https://demo.access.worldpay.com/modernmart/registerPayment
https://demo.access.worldpay.com/modernmart/error
*/

import React, {useEffect, useLayoutEffect} from "react";
import "./CheckoutIntegrationSample.css";

function scriptAlreadyLoaded(src) {
  return document.querySelector(`script[src="${src}"]`);
}

function loadCheckoutScript(src) {
  return new Promise((resolve, reject) => {
    if (scriptAlreadyLoaded(src)) {
      resolve();
      return;
    }

    let checkoutScript = document.createElement("script");
    checkoutScript.src = src;
    checkoutScript.onload = resolve;
    checkoutScript.onerror = reject;
    document.head.appendChild(checkoutScript);
  });
}

function addWorldpayCheckoutToPage() {
  return new Promise((resolve, reject) => {
    (function () {
       if(typeof window.Worldpay !== "undefined") {
         window.Worldpay.checkout.init(
        {
          id: "your-checkout-id",
          form: "#container",
          fields: {
            pan: {
              selector: "#card-pan",
            },
            expiry: {
              selector: "#card-expiry",
            },
            cvv: {
              selector: "#card-cvv",
            },
          },
          styles: {
            "input.is-valid": {
              "color": "green",
            },
            "input.is-invalid": {
              "color": "red",
            },
            "input.is-onfocus": {
              "color": "black",
            },
          },
          enablePanFormatting: true,
        },
        function (error, checkout) {
          if (error) {
            reject(error);
          } else {
            resolve(checkout);
          }
        },
      );
       }
    })();
  });
}

function CheckoutIntegrationSample() {
  const checkoutScriptUrl = "https://try.access.worldpay.com/access-checkout/v2/checkout.js";
  let checkout;

  function generateSession () {
    checkout.generateSessionState(
      function (error, session) {
        if (error) {
          console.warn(`Failed to generate session: ${error}`);
          return;
        }

        const infoDiv = document.querySelector(".info");
        infoDiv.innerHTML += `<div>Session retrieved is ${session}</div>`;
      });
  }

  function clearForm () {
    checkout.clearForm(() => {
      document.querySelector(".info").innerHTML = "";
    });
  }

  useEffect(() => {
    loadCheckoutScript(checkoutScriptUrl)
      .then(() => {
        addWorldpayCheckoutToPage()
          .then((checkoutInstance) => {
            checkout = checkoutInstance;
          })
          .catch(console.warn);
      })
      .catch(console.warn);
  }, []);

  useLayoutEffect(() => {
    // Make sure to call the remove method (once) in order to deallocate the SDK from memory
    return () => checkout && checkout.remove();
  },
    []);

  return (
    <section className="container" id="container">
      <section className="card">
        <section id="card-pan" className="field" />
        <section className="columns">
        <section>
        <section id="card-expiry" className="field" />
        </section>
        <section>
        <section id="card-cvv" className="field" />
        </section>
        </section>
        <section className="buttons">
          <button className="submit" type="button" onClick={generateSession}>
            Generate Session
          </button>
          <button className="clear" type="button" onClick={clearForm}>
            Clear
          </button>
        </section>
      </section>
      <div id="info" className="info" />
    </section>
  );
}

export default CheckoutIntegrationSample;


/*
API

import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionToken } = req.body;

  if (!sessionToken) {
    return res.status(400).json({ success: false, error: "Missing session token" });
  }

  try {
    // Step 1️⃣: Convert Session to Verified Token
    const verifiedTokenResponse = await fetch("https://try.access.worldpay.com/verifiedTokens", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(process.env.WORLDPAY_SERVICE_KEY).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session: sessionToken }),
    });

    const verifiedToken = await verifiedTokenResponse.json();

    if (!verifiedToken || !verifiedToken.token) {
      return res.status(500).json({ success: false, error: "Failed to generate verified token" });
    }

    console.log("Verified Token:", verifiedToken.token);

    // Step 2️⃣: Process Payment with Verified Token & 3DS
    const paymentResponse = await fetch("https://try.access.worldpay.com/api/payments", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(process.env.WORLDPAY_SERVICE_KEY).toString("base64")}`,
        "Content-Type": "application/json",
        "WP-Api-Version": "2024-06-01"
      },
      body: JSON.stringify({
        "transactionReference": "ORDER-12345",
        "merchant": {
          "entity": "default"
        },
        "instruction": {
          "method": "card",
          "paymentInstrument": {
            "type": "plain",
            "cardHolderName": "John Doe",
            "cardNumber": "4444333322221111",
            "expiryDate": {
              "month": 12,
              "year": 2030
            },
            "billingAddress": {
              "address1": "123 Main Street",
              "postalCode": "SW1A 1AA",
              "city": "London",
              "countryCode": "GB"
            },
            "cvc": "123"
          },
          "threeDS": {  // Enable 3DS Authentication
            "challengePreference": "challenge-required",
            "challengeIndicator": "04"
          },
          "fraud": { // Enable FraudSight
            "customerAccountAgeIndicator": "01",
            "shippingMethodIndicator": "02"
          },
          "value": {
            "currency": "GBP",
            "amount": 1000
          }
        }
      }),
    });

    const paymentResult = await paymentResponse.json();

    if (paymentResult && paymentResult.paymentStatus === "SUCCESS") {
      return res.status(200).json({ success: true, data: paymentResult });
    } else {
      return res.status(500).json({ success: false, error: "Payment failed", details: paymentResult });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
*/