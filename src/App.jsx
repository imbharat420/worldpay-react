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