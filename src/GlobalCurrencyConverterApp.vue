<template>
  <v-app>
    <v-main>
      <MainComponent />
    </v-main>
  </v-app>
</template>

<script>
import MainComponent from './components/MainComponent';

export default {
  name: 'GlobalCurrencyConverterApp',

  components: {
    MainComponent,
  },

  data: () => ({
    //
  }),
};
</script>
