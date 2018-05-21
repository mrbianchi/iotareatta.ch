<template>
    <div class="container">
      <div class="columns">
        <div class="column is-two-thirds">
          <div class="panel-content">
          <div class="panel-block txrow">
            <div class="columns">
              <div class="column is-2 content">
                Address
              </div>
              <div class="column field control txvalue">
                <router-link :to="`/search/address/${hash}`">
                  {{hash}}
                </router-link>
              </div>
            </div>
          </div>
          <div class="panel-block txrow">
            <div class="columns">
              <div class="column is-2 content">
                Current Balance
              </div>
              <div class="column field control txvalue">
                <div>
                  {{ balanceFormatted }}
                </div>
                <div v-if="balance !== null">
                  This is roughly <sup>1</sup>&frasl;<sub>{{ roundedFractionalSupplyFormatted }}</sub> the supply of IOTA (actual: <sup>1</sup>&frasl;<sub>{{ actualFractionalSupplyFormatted }}</sub>)
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
        <div class="column">
          <canvas style="margin-top: -14px" ref="addressqrcode"></canvas>
        </div>
      </div>
      <hr>
      <h1 class="title is-4">
        History
      </h1>
      <h1 v-if="results" class="subtitle is-5">
        Found {{ results.length }} relevant tx{{results.length > 1 ? 's' : '' }}
      </h1>
      <div class="box">
        <search-tx :iota="iota" :results="results" :isCollapsed="true"></search-tx>
      </div>
    </div>
</template>

<script>
  import SearchTx from '@/components/searchresults/tx'
  import SearchBundle from '@/components/searchresults/bundle'
  import ValueHelper from '../mixins/ValuesHelper'
  import QRCode from 'qrcode'

  export default {
    name: 'search-address',
    mixins: [ValueHelper],
    components: {
      SearchTx,
      SearchBundle
    },
    data() {
      return {
        balanceRetrievalError: null
      }
    },
    props: ['iota', 'results', 'hash'],
    mounted () {
      QRCode.toCanvas(this.$refs.addressqrcode, this.hash, (error) => {
        if(error) { console.log(`Error while making qr code: ${error}`) }
      })
    },
    computed: {
      balance() {
        return (this.balances && this.balances.length) > 0 ? this.balances[0] : null
      },
      balanceFormatted () {
        if(this.balanceRetrievalError) {
          return 'An error occurred while retrieving the balance'
        }
        return this.balance ? this.toUnits(this.balance, false, this.iota) : 'Calculating...'
      },
      roundedFractionalSupplyFormatted() {
        const denominatorPower = Math.trunc(Math.log10(this.actualFractionalSupply)) + 1
        const normalizedDenominator = Math.pow(10, denominatorPower).toLocaleString()
        return normalizedDenominator
      },
      actualFractionalSupply() {
        const maxSupply = 2779530283277761
        const fractionalSupply = this.balance / maxSupply
        const denominator = 1 / fractionalSupply
        return denominator
      },
      actualFractionalSupplyFormatted() {
        return this.actualFractionalSupply.toLocaleString(undefined, {
          maximumFractionDigits: 0
        })
      }
    },
    asyncComputed: {
      balances: {
        lazy: true,
        get () {
          this.balanceRetrievalError = null
          return new Promise((resolve, reject) => {
            this.iota.api.getBalances([this.hash], 100, (err, res) => {
              if (err) {
                this.balanceRetrievalError = err
                return resolve([])
              }
              return resolve(res.balances)
            })
          })
        },
        default: []
      }
    }
  }
</script>



<style scoped>
  .txvalue {
    word-break: break-all;
    overflow-wrap: break-word;
  }

  .txrow {
    display: block;
  }

  .column {
    margin-bottom: 0px !important;
  }
</style>
