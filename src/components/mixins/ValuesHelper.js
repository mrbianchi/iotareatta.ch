module.exports = {
  asyncComputed: {
    priceUSD: {
      get () {
        return this.axios.get('https://min-api.cryptocompare.com/data/price?fsym=IOT&tsyms=USD').then(response => response.data.USD)
      },
      default: 0
    }
  },
  methods: {
    toStringValue (value, iota) {
      if(value > 0) {
        return "IN  " + this.toUnits(value, true, iota)
      } else {
        return "OUT " + this.toUnits(-value, true, iota)
      }
    },
    toUnits(val, short, iota) {
      val = Math.abs(val)
      const units = ['i', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi']
      const unit = units[Math.floor((('' + val).length - 1) / 3)]
      let num = iota.utils.convertUnits(val, 'i', unit)

      // TODO: make sure this works for very small amounts of money; fractional cents
      let usd = this.toUSD(val).toLocaleString(undefined, {
        maximumFractionDigits: 3
      })

      if(short) {
        num = num.toFixed(Math.max(0, 3 - (Math.round(num) + '').length))
      }

      const usdPerMiota = this.priceUSD.toLocaleString(undefined, {
        maximumFractionDigits: 3
      })

      return `${num}${unit} ~$${usd} @ $${usdPerMiota}/Mi`
    },
    toUSD(val) {
      return val * this.priceUSD / 1000000
    }
  }
};
