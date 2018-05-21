<template>
  <div>
    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Hash
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/tx/${tx.hash}`">
          {{tx.hash}}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Address
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/address/${tx.address}`">
            {{tx.address}}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          UTF-8 Decoded Address (<a href="https://www.npmjs.com/package/tryte-utf8-json-codec" target="_blank">tryte-utf8-json-codec</a>)
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/address/${tx.address}`">
            {{ decodedUTF8FromString(tx.address) }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Tag
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/tag/${tx.tag}`">
            {{tx.tag}}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Value
        </div>
        <div class="column is-three-quarters field control txvalue">
          {{ valueFormatted }}
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Timestamp
        </div>
        <div class="column is-three-quarters field control txvalue">
          {{(tx.timestamp * 1000) | moment("MMMM Do YYYY, h:mm:ss a") }} ({{(tx.timestamp * 1000) | moment("from","now") }})
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Bundle Hash
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/bundle/${tx.bundle}`">
            {{tx.bundle}}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Current / Last Index
        </div>
        <div class="column is-three-quarters field control txvalue">
          {{tx.currentIndex}} / {{tx.lastIndex}}
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Nonce
        </div>
        <div class="column is-three-quarters field control txvalue">
          {{tx.nonce}}
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Trunk Hash
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/tx/${tx.trunkTransaction}`">
            {{tx.trunkTransaction}}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Branch Hash
        </div>
        <div class="column is-three-quarters field control txvalue">
          <router-link :to="`/search/tx/${tx.branchTransaction}`">
            {{tx.branchTransaction}}
          </router-link>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          Message
        </div>
        <div class="column is-three-quarters field control txvalue">
          <textarea readonly spellcheck="false" class="textarea"
                    style="white-space: normal; font-size: small; font-family: Monospace; padding: 8px;">
            {{tx.signatureMessageFragment}}
          </textarea>

        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          ASCII Decoded Message (<a href="https://github.com/iotaledger/iota.lib.js" target="_blank">iota.utils.fromTrytes</a>)
        </div>
        <div class="column is-three-quarters field control">
          <textarea readonly spellcheck="false" class="textarea"
                    style="white-space: normal; font-size: small; font-family: Monospace; padding: 8px;">
            {{ decodedAsciiFromMessage(iota, tx) }}
          </textarea>
        </div>
      </div>
    </div>

    <div class="panel-block txrow">
      <div class="columns">
        <div class="column is-one-quarter content">
          UTF-8 Decoded Message (<a href="https://www.npmjs.com/package/tryte-utf8-json-codec" target="_blank">tryte-utf8-json-codec</a>)
        </div>
        <div class="column is-three-quarters field control">
          <textarea readonly spellcheck="false" class="textarea"
                    style="white-space: normal; font-size: small; font-family: Monospace; padding: 8px;">
            {{ decodedUTF8FromString(tx.signatureMessageFragment) }}
          </textarea>
        </div>
      </div>
    </div>

  </div>
</template>



<script>
  import ValueHelper from '../mixins/ValuesHelper'
  import TryteCodec from 'tryte-utf8-json-codec'

  export default {
    name: 'tx-property',
    mixins: [ValueHelper],
    props: ['tx', 'iota'],
    computed: {
      valueFormatted() {
        if(this.tx.value === 0) { return '0' }
        return `${this.toUnits(this.tx.value, false, this.iota)} (${this.tx.value.toLocaleString()} IOTA)`
      }
    },
    methods: {
      decodedAsciiFromMessage (iota, tx) {
        let message = tx.signatureMessageFragment
        if (message.length <= 0) {
          return ''
        }
        if (message.length % 2 === 1) {
          message = message.slice(0, -1)
        }
        return iota.utils.fromTrytes(message)
      },
      decodedUTF8FromString (string) {
        if (string.length <= 0) {
          return ''
        }
        try {
          return TryteCodec.utf8StringFromTrytes(string)
        } catch (e) {
          return ''
        }
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
