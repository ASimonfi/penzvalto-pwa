const defaultRates = {
  HUF: 1,
};

const currencyNames = {
  HUF: "Magyar forint",
  USD: "Amerikai dollár",
  EUR: "Euró",
  JPY: "Japán jen",
  GBP: "Angol font",
  CNY: "Kínai jüan",
  CHF: "Svájci frank",
  CAD: "Kanadai dollár",
  AUD: "Ausztrál dollár",
  HKD: "Hongkongi dollár",
  SGD: "Szingapúri dollár",
};

const rateCurrencies = ["USD", "EUR", "JPY", "GBP", "CNY", "CHF", "CAD", "AUD", "HKD", "SGD"];

const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#fromCurrency");
const toSelect = document.querySelector("#toCurrency");
const resultValue = document.querySelector("#resultValue");
const ratesList = document.querySelector("#ratesList");
const swapButton = document.querySelector("#swapButton");
const resetRatesButton = document.querySelector("#resetRates");
const rateStatus = document.querySelector("#rateStatus");

let rates = loadRates();
let lastUpdated = localStorage.getItem("penzvalto-last-updated");

function loadRates() {
  return { ...defaultRates };
}

function saveRates() {
  // Mindig friss adatot kerünk, ezért nem mentjük el külön az árfolyamokat.
}

function saveLastUpdated(dateText) {
  lastUpdated = dateText;
  localStorage.setItem("penzvalto-last-updated", dateText);
}

function updateRateStatus(message) {
  rateStatus.textContent = message;
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateText) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateText));
}

function calculate() {
  const amount = Number(amountInput.value);
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;

  if (!rates[fromCurrency] || !rates[toCurrency]) {
    resultValue.textContent = "-";
    return;
  }

  if (!amount || amount < 0) {
    resultValue.textContent = formatMoney(0, toCurrency || "HUF");
    return;
  }

  const amountInHuf = amount * rates[fromCurrency];
  const convertedAmount = amountInHuf / rates[toCurrency];
  resultValue.textContent = formatMoney(convertedAmount, toCurrency);
}

async function refreshRates() {
      updateRateStatus("Árfolyamok frissítése folyamatban.");

  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rates?base=HUF&quotes=${rateCurrencies.join(",")}`);

    if (!response.ok) {
      throw new Error("Nem sikerült lekérni az árfolyamokat.");
    }

    const data = await response.json();
    const apiRates = Object.fromEntries(data.map((item) => [item.quote, item.rate]));

    if (rateCurrencies.some((code) => !apiRates[code])) {
      throw new Error("Hiányos árfolyam adat érkezett.");
    }

    function hufPerCurrency(code) {
      const value = 1 / apiRates[code];
      return value >= 10 ? Math.round(value) : Number(value.toFixed(2));
    }

    rates = {
      HUF: 1,
      USD: hufPerCurrency("USD"),
      EUR: hufPerCurrency("EUR"),
      JPY: hufPerCurrency("JPY"),
      GBP: hufPerCurrency("GBP"),
      CNY: hufPerCurrency("CNY"),
      CHF: hufPerCurrency("CHF"),
      CAD: hufPerCurrency("CAD"),
      AUD: hufPerCurrency("AUD"),
      HKD: hufPerCurrency("HKD"),
      SGD: hufPerCurrency("SGD"),
    };

    saveRates();
    saveLastUpdated(data[0].date);
    fillCurrencySelectors();
    renderRateInputs();
    calculate();
    updateRateStatus(`Frissítve: ${formatDate(data[0].date)}.`);
  } catch (error) {
    updateRateStatus("Az eléréshez internetkapcsolat szükséges.");
    resultValue.textContent = "-";
  } finally {
          }
}

function fillCurrencySelectors() {
  const previousFrom = fromSelect.value || "HUF";
  const previousTo = toSelect.value || "EUR";
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  Object.keys(rates).forEach((code) => {
    const fromOption = new Option(`${code} - ${currencyNames[code]}`, code);
    const toOption = new Option(`${code} - ${currencyNames[code]}`, code);
    fromSelect.add(fromOption);
    toSelect.add(toOption);
  });

  fromSelect.value = rates[previousFrom] ? previousFrom : "HUF";
  toSelect.value = rates[previousTo] ? previousTo : "EUR";
}

function renderRateInputs() {
  ratesList.innerHTML = "";

  rateCurrencies.forEach((code) => {
    if (!rates[code]) {
      return;
    }

    const row = document.createElement("div");
    row.className = "rate-item";

    const label = document.createElement("div");
    label.className = "rate-code";
    label.textContent = code;

    const value = document.createElement("div");
    value.className = "rate-value";
    value.textContent = `${formatRateValue(rates[code])} Ft`;

    row.append(label, value);
    ratesList.append(row);
  });
}

function formatRateValue(value) {
  return new Intl.NumberFormat("hu-HU", {
    maximumFractionDigits: value >= 10 ? 0 : 2,
  }).format(value);
}


amountInput.addEventListener("input", calculate);
fromSelect.addEventListener("change", calculate);
toSelect.addEventListener("change", calculate);

swapButton.addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  calculate();
});

resetRatesButton.addEventListener("click", () => {
  refreshRates();
});


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

fillCurrencySelectors();
renderRateInputs();
calculate();
refreshRates();
