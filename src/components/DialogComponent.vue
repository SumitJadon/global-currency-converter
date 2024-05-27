<template>
  <div v-show="show" class="overlay">
    <div class="dialog">
      <div class="dialog__content">
        <h1 class="dialog__title" v-text="title"></h1>
      </div>
      <v-card-text>
        <select v-model="currencyObj">
          <option v-for="currency in items" :key="currency.currency_code" :value="currency">
            {{ currency.currency_code }} - {{ currency.currency_name }}
          </option>
        </select>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="plain" @click="cancel">{{ $t("cancel") }}</v-btn>
        <v-btn color="primary" variant="tonal" @click="add">{{ $t("save_currency") }}</v-btn>
      </v-card-actions>
    </div>
  </div>
</template>

<script>
export default {
  props: ['show', 'title', 'cancel', 'add', 'items'],
  watch: {
    currencyObj: function (val) {
      console.log("Currency value", val);
      this.emitValue();
    }
  },
  methods: {
    emitValue: function () {
      this.$emit("currency-obj", this.currencyObj);
    },
  },
  data: () => ({
    currencyObj: {}
  }),
}
</script>

<style lang="scss" scoped>
.overlay {
  --tw-bg-opacity: 1;
  background-color: rgba(0, 0, 0, var(--tw-bg-opacity));
  --tw-bg-opacity: 0.5;
  height: 100%;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  width: 100%;
  z-index: 10;
}

h1 {
  padding-top: 10px;
  color: #5fbaaf;
}

.dialog {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity));
  border-radius: 0.75rem;
  margin-left: auto;
  margin-right: auto;
  margin-top: 8rem;
  max-width: 100%;
  width: 30rem;
}

select {
  width: 20rem;
  padding: 5px;
  margin: 10px;
  border: 1px solid #5fbaaf;
  outline: none;
}
</style>