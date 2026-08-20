const defaultRates = {
  HUF: 1,
  EUR: 395,
  USD: 360,
  GBP: 455,
};

const currencyNames = {
  HUF: "Magyar forint",
  EUR: "Euro",
  USD: "Amerikai dollar",
  GBP: "Angol font",
};

const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#fromCurrency");
const toSelect = document.querySelector("#toCurrency");
const resultValue = document.querySelector("#resultValue");
const ratesList = document.querySelector("#ratesList");
const swapButton = document.querySelector("#swapButton");
const resetRatesButton = document.querySelector("#resetRates");
const refreshRatesButton = document.querySelector("#refreshRates");
const rateStatus = document.querySelector("#rateStatus");
const installStatus = document.querySelector("#installStatus");

let rates = loadRates();
let lastUpdated = localStorage.getItem("penzvalto-last-updated");

function loadRates() {
  const savedRates = localStorage.getItem("penzvalto-rates");
  return savedRates ? JSON.parse(savedRates) : { ...defaultRates };
}

function saveRates() {
  localStorage.setItem("penzvalto-rates", JSON.stringify(rates));
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

  if (!amount || amount < 0) {
    resultValue.textContent = formatMoney(0, toCurrency);
    return;
  }

  const amountInHuf = amount * rates[fromCurrency];
  const convertedAmount = amountInHuf / rates[toCurrency];
  resultValue.textContent = formatMoney(convertedAmount, toCurrency);
}

async function refreshRates() {
  refreshRatesButton.disabled = true;
  refreshRatesButton.textContent = "Frissites...";
  updateRateStatus("Arfolyamok frissitese folyamatban.");

  try {
    const response = await fetch("https://api.frankfurter.dev/v2/rates?base=EUR&quotes=HUF,USD,GBP");

    if (!response.ok) {
      throw new Error("Nem sikerult lekerni az arfolyamokat.");
    }

    const data = await response.json();
    const apiRates = Object.fromEntries(data.map((item) => [item.quote, item.rate]));

    if (!apiRates.HUF || !apiRates.USD || !apiRates.GBP) {
      throw new Error("Hianyos arfolyam adat erkezett.");
    }

    rates = {
      HUF: 1,
      EUR: Number(apiRates.HUF.toFixed(4)),
      USD: Number((apiRates.HUF / apiRates.USD).toFixed(4)),
      GBP: Number((apiRates.HUF / apiRates.GBP).toFixed(4)),
    };

    saveRates();
    saveLastUpdated(data[0].date);
    renderRateInputs();
    calculate();
    updateRateStatus(`Frissitve: ${formatDate(data[0].date)}. Az arfolyamokat a bongeszo megjegyzi.`);
  } catch (error) {
    const savedText = lastUpdated ? ` Utolso sikeres frissites: ${formatDate(lastUpdated)}.` : "";
    updateRateStatus(`Nem sikerult frissiteni. Az app a mentett arfolyamokat hasznalja.${savedText}`);
  } finally {
    refreshRatesButton.disabled = false;
    refreshRatesButton.textContent = "Frissites";
  }
}

function fillCurrencySelectors() {
  Object.keys(rates).forEach((code) => {
    const fromOption = new Option(`${code} - ${currencyNames[code]}`, code);
    const toOption = new Option(`${code} - ${currencyNames[code]}`, code);
    fromSelect.add(fromOption);
    toSelect.add(toOption);
  });

  fromSelect.value = "HUF";
  toSelect.value = "EUR";
}

function renderRateInputs() {
  ratesList.innerHTML = "";

  Object.keys(rates).forEach((code) => {
    const row = document.createElement("div");
    row.className = "rate-item";

    const label = document.createElement("div");
    label.className = "rate-code";
    label.textContent = code;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0.0001";
    input.step = "0.0001";
    input.value = rates[code];
    input.disabled = code === "HUF";
    input.setAttribute("aria-label", `${code} arfolyam forintban`);

    input.addEventListener("input", () => {
      const value = Number(input.value);
      if (value > 0) {
        rates[code] = value;
        saveRates();
        calculate();
      }
    });

    row.append(label, input);
    ratesList.append(row);
  });
}

function updateInstallStatus() {
  const isStandalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
  installStatus.textContent = isStandalone ? "Telepitve" : "Bongeszo mod";
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
  rates = { ...defaultRates };
  saveRates();
  localStorage.removeItem("penzvalto-last-updated");
  lastUpdated = null;
  renderRateInputs();
  calculate();
  updateRateStatus("Az alap arfolyamok visszaallitva. A Frissites gombbal ujra lekerheted az aktualis adatokat.");
});

refreshRatesButton.addEventListener("click", refreshRates);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

fillCurrencySelectors();
renderRateInputs();
updateInstallStatus();
calculate();
refreshRates();
