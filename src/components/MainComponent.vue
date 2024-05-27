<template>
    <v-container>
        <div id="app">
            <div class="navbar-center basis-1/2">
                <a class="font-bold text-4xl">
                    <h1>{{ $t("app_name") }}</h1>
                </a>
            </div>
            <div class="container-one">
                <div class="container-one">
                    <DialogComponent :show="showDialog" :cancel="cancel" :add="saveCurrency"
                        :title="$t('select_currency')" :items="allCurrencies" @currency-obj="codeFrom" />
                    <select class="select-box" v-model="primary_Currency" @change="updateData()">
                        <option v-for="currency in activeCurrencies" :key="currency.currency_name"
                            :value="currency.currency_code">{{ currency.currency_code }} - {{ currency.currency_name }}
                        </option>
                    </select>
                    <v-text-field :label="$t('amount')" clearable type="number" :rules="rules" :min="0.00"
                        v-model="primaryAmount" @input="calculateData()"></v-text-field>
                </div>
            </div>
            <div class="container-three">
                <div class="container-three">
                    <select class="select-box" v-model="secondary_Currency" @change="updateData()">
                        <option v-for="currency in activeCurrencies" :key="currency.currency_name"
                            :value="currency.currency_code">{{ currency.currency_code }} - {{ currency.currency_name }}
                        </option>
                    </select>
                    <v-text-field :label="$t('converted_amount')" clearable type="number" placeholder="0.00"
                        :rules="rules" :min="0.00" v-model="secondaryAmount"></v-text-field>
                </div>
            </div>
            <div class="container-four">
                <div class="container">
                    <div class="container-two">
                        <v-btn class="text-none font-weight-regular" color="primary" @click="switchValues()">
                            {{ $t("switch_currency") }}</v-btn>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <v-btn class="text-none font-weight-regular" color="primary" @click="showDialog = true">
                            {{ $t("add_currency") }}</v-btn>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                    <br />
                    <h4 id="LiveTotalValue">{{ primaryAmount }} {{ primary_Currency }} = {{ secondaryAmount }}
                        {{ secondary_Currency }}
                    </h4>
                    <br />
                    <h4 id="baseValue"><b>{{ $t("todays_rate") }} {{ primary_Currency }} {{ $t("equals") }} {{ rate }}
                            {{ secondary_Currency }}
                        </b></h4>
                </div>
            </div>
        </div>
    </v-container>
</template>

<script>
import Currencies from '../data/currencies';
import DialogComponent from './DialogComponent';
import strings from "../assets/strings";

export default {
    name: 'MainComponent',

    components: { DialogComponent },

    mounted() {
    },
    created() {
        this.getLocale();
        this.getLanguages();
        this.getAvailableCurrencies();
        this.updateData();
    },
    data: () => ({
        responseData: [],
        rules: [
            v => !!v || "Please enter amount great than 0.",
            v => v >= 0 || "Amount should be greater than zero."
        ],
        showDialog: false,
        allCurrencies: [],
        activeCurrencies: [],
        api_key: '36d8554ac32e0a0c3c507925',
        base_code: 'USD',
        currencySelector: [],
        selectedCurrency: {},
        primary_Currency: "USD",
        secondary_Currency: "EUR",
        rate: "",
        primaryAmount: 1,
        secondaryAmount: "0.00",
        languages: [],
        locale: '',
    }),
    methods: {
        getLocale() {
            const locale = localStorage.getItem('locale') || navigator.language || 'en-US';
            this.updateLocale(locale);
        },
        updateLocale(locale) {
            this.locale = locale;
            this.$i18n.locale = this.locale;
            localStorage.setItem('locale', this.locale);
        },
        getLanguages() {
            this.languages = strings.languages;
        },
        cancel() {
            console.log('cancel');
            this.selectedCurrency = null;
            this.showDialog = false;
        },

        codeFrom(currencyObj) {
            console.log("currencyObj in Parent", currencyObj);
            this.selectedCurrency = currencyObj;
        },
        sortCurrencies() {
            this.allCurrencies.sort((a, b) => {
                if (a.currency_name < b.currency_name) {
                    return -1;
                }
                if (a.currency_name > b.currency_name) {
                    return 1;
                }
                return 0;
            });
        },
        updateData() {
            console.log('called');
            if (!!this.primaryAmount && this.primaryAmount >= 1) {
                fetch(`https://v6.exchangerate-api.com/v6/${this.api_key}/latest/${this.primary_Currency}`)
                    .then(async res => await res.json())
                    .then(res => {
                        fetch(`https://v6.exchangerate-api.com/v6/${this.api_key}/codes`)
                            .then(async data => await data.json())
                            .then(data => {
                                let obj = {
                                    LAST_UPDATE: res['time_last_update_utc'],
                                    BASE_CODE: this.base_code,
                                    RATES: res.conversion_rates,
                                    CURRENCIES: Object.keys(res.conversion_rates).map((key) => {
                                        let name = data['supported_codes'][key];
                                        data.supported_codes.forEach((item) => {
                                            if (item[0] === key) {
                                                name = item[1];
                                            }
                                        });
                                        return {
                                            currency_code: key,
                                            currency_name: name,
                                            currency_rate: res.conversion_rates[key],
                                            currency_value: 0.00,
                                        }
                                    })
                                };
                                let jsonContent = JSON.stringify(obj);
                                localStorage.setItem("data", jsonContent);
                                this.getData();
                            })
                    })
            }
            else {
                this.secondaryAmount = "0.00";
                console.log("Non negative amount no need for the call", this.primaryAmount);
            }

        },
        getData() {
            localStorage.getItem('data') ? this.allCurrencies = JSON.parse(localStorage.getItem('data')).CURRENCIES : this.updateData();
            this.sortCurrencies();
            this.rate = parseFloat(this.allCurrencies.filter(item => item.currency_code == this.secondary_Currency)[0].currency_rate).toFixed(2);
            this.secondaryAmount = parseFloat(this.primaryAmount * this.rate).toFixed(2);
            this.addActiveCurrency();
        },
        addActiveCurrency() {
            if (this.activeCurrencies.length < 1) {
                this.currencySelector.forEach((currency) => {
                    this.activeCurrencies.push(this.allCurrencies.filter(item => item.currency_code == currency.code)[0]);
                });
            }
        },
        calculateData() {
            if (!!this.primaryAmount && this.primaryAmount >= 1) {
                console.log("primaryAmount", this.primaryAmount);
                console.log("rate", this.rate);
                this.secondaryAmount = parseFloat(this.primaryAmount * this.rate).toFixed(2);
                console.log("secondaryAmount", this.secondaryAmount);
            }
            else {
                this.secondaryAmount = "0.00";
                console.log("Non negative amount no need for the call", this.primaryAmount);
            }
        },
        getAvailableCurrencies() {
            const sortedLoadedCurrencies = Currencies.currencyChoices.sort((a, b) => {
                if (a.code < b.code) return -1;
                if (a.code > b.code) return 1;
                return 0;
            });
            this.currencySelector = [...sortedLoadedCurrencies];
            console.log('currencies', [...sortedLoadedCurrencies]);
        },
        saveCurrency() {
            if (this.selectedCurrency.currency_code != null) {
                console.log('saveCurrency called');
                this.activeCurrencies.push(this.selectedCurrency);
                this.allCurrencies = this.allCurrencies.filter(item => item.currency_code !== this.selectedCurrency.currency_code);
                this.sortCurrencies();
                this.showDialog = false;
            }
        },
        switchValues() {
            const temporaryValue = this.primary_Currency;
            this.primary_Currency = this.secondary_Currency;
            this.secondary_Currency = temporaryValue;
            console.log("Primary Code Value", this.primary_Currency);
            console.log("Secondary Code Value", this.secondary_Currency);
            if (!!this.primaryAmount && this.primaryAmount >= 1) {
                this.updateData();
            }
        }
    }
}
</script>

<style lang="scss" scoped>
html {
    background: #f4f4f4
}

#app {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    width: 100%;
    height: 100%;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
    padding: 30px 10px 30px 10px;
    color: #5fbaaf;
}

img {
    width: 150px;
}

.container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    text-align: center;
}

.container-one {
    display: flex;
    align-items: center;
    justify-content: space-between;

}

.container-two {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.container-three {
    display: flex;
    align-items: center;
    justify-content: space-between;

}

.select-box {
    width: auto;
    border: 1px solid #5fbaaf;
    padding: 1px;
    outline: none;
}

#lastlyUpdated {
    font-weight: 500;
}

#baseValue {
    font-weight: 500;
}

@media (min-width: 640px) {}

@media (min-width: 768px) {}

@media (min-width: 1024px) {}

@media (min-width: 1280px) {}

@media (min-width: 1536px) {}
</style>
