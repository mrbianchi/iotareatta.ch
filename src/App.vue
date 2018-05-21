<template>
  <div id="app">
    <div class="container">
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link :to="{ name: 'Home' }" class="navbar-item">
            <img src="./assets/logo.png" alt="logo" width="28" height="28" style="margin-right: 6px">
            <h1 class="heading title"></h1>
            <h1 class="heading title is-4">Open IOTA</h1>
          </router-link>
          <div class="navbar-burger" v-bind:class="{ 'is-active': navVisible }" @click="navVisible = !navVisible">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="navbar-menu" v-bind:class="{ 'is-active': navVisible }">
          <div class="navbar-start">

          </div>
          <div class="navbar-end">

            <div class="navbar-item animated" v-bind:class="{'fadeInDown': priceUSD !== 0}" style="opacity: 0">
              <a href="https://www.cryptocompare.com/coins/iot/overview/USD" class="button is-info" target="_blank">
                ${{priceUSD}}/Mi
              </a>
            </div>

            <div class="navbar-item">
              <b-dropdown @change="connectToIOTA" v-model="iota.provider" position="is-bottom-left">

                <button type="button" slot="trigger" class="button" :class="{
                    'is-loading': iota.status === 'Connecting',
                    'is-primary': iota.status === 'Connected',
                    'is-danger': iota.status === 'Failed'}">
                  <span> {{ this.iota.status }} </span>
                  <b-icon icon="arrow_drop_down"></b-icon>
                </button>

                <b-dropdown-item custom>
                  <h1 class="title is-6">Latest Milestone:</h1>
                  <b-field class="subtitle">
                    <b-input expanded spellcheck="false" readonly :value="iota.latestMilestone"></b-input>
                    <p class="control">
                      <button class="button is-primary" v-clipboard:copy="iota.latestMilestone">Copy</button>
                    </p>
                  </b-field>
                </b-dropdown-item>
                <b-dropdown-item custom>
                  <h1 class="title is-6">Latest Solid Milestone:</h1>
                  <b-field class="subtitle">
                    <b-input expanded spellcheck="false" readonly :value="iota.latestSolidMilestone"></b-input>
                    <p class="control">
                      <button class="button is-primary" v-clipboard:copy="iota.latestSolidMilestone">Copy</button>
                    </p>
                  </b-field>
                </b-dropdown-item>
                <b-dropdown-item custom>
                  Node version: <b>{{ iota.version || "..." }}</b>
                </b-dropdown-item>
                <b-dropdown-item custom>
                  Node health: <b>{{ providerHealth }}</b>
                </b-dropdown-item>
                <hr class="dropdown-divider">
                <div v-for="prov in providerList">
                  <b-dropdown-item :value="prov">
                    <div class="media">
                      <b-icon v-if="prov.includes('https:')" class="media-left" icon="lock"></b-icon>
                      <b-icon v-else class="media-left" icon="public"></b-icon>
                      <div class="media-content">
                        <h3>{{ prov }}</h3>
                      </div>
                    </div>
                  </b-dropdown-item>
                </div>
                <b-dropdown-item custom>
                  <h1 class="title is-6">Custom Provider:</h1>
                  <b-field class="subtitle">
                    <b-input expanded spellcheck="false" v-model.sync="customProvider"></b-input>
                    <p class="control">
                      <button class="button is-primary" @click="addProvider">Add</button>
                    </p>
                  </b-field>
                </b-dropdown-item>
              </b-dropdown>

            </div>

            <div class="navbar-item" >
              <a href="https://github.com/pRizz/open-iota" class="button" target="_blank">
              <span class="icon">
                <i class="fa fa-github"></i>
              </span>
                <span>GitHub</span>
              </a>
            </div>

          </div>
        </div>
      </nav>
    </div>

    <router-view :iota="iota.link"></router-view>


    <!-- Leaderboard Ad 1 -->
    <ins class="adsbygoogle"
         style="display:inline-block;width:728px;height:90px"
         data-ad-client="ca-pub-5014469443290772"
         data-ad-slot="1008368143"></ins>

    <footer class="footer">
      <div class="container">
        <div class="columns">
          <div class="column">
            <h1 class="heading title is-4">Open IOTA</h1>
            <h1 class="subtitle is-6">A simple, free, open-source tangle explorer for IOTA</h1>
          </div>
          <div class="column">
            <p>
              For more information, view the README on
              <a class="button is-small" href="https://github.com/pRizz/open-iota/blob/master/README.md" target="_blank">
                  <span class="icon is-small">
                    <i class="fa fa-github"></i>
                  </span>
                <span>GitHub</span>
              </a>
            </p>
            <p>
              This site is hosted by <a target="_blank" href="https://www.prizzventuresllc.com/">P Rizz Ventures LLC</a>
            </p>
            <p>
              <a href="https://open-iota.prizziota.com/PrivacyPolicy.txt" target="_blank">Privacy Policy</a>
            </p>
          </div>
          <div class="column">
            <p>Created by Laurence Squires
              <a class="button is-small" href="https://github.com/lsquires/open-iota" target="_blank">
                <span class="icon is-small">
                  <i class="fa fa-github"></i>
                </span>
                <span>GitHub</span>
              </a>
            </p>
            <p>Forked by Peter Ryszkiewicz
              <a class="button is-small" href="https://github.com/pRizz/open-iota" target="_blank">
                <span class="icon is-small">
                  <i class="fa fa-github"></i>
                </span>
                <span>GitHub</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>

    <b-modal :active.sync="isProviderModalActive">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Changing IOTA Server</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          <div>
            Doing this will open this website in another tab.
          </div>
          <br/>
          <div>
            The technical reason for this is that when you interact with an <code>http</code> server, but the website itself is served over <code>https</code>, the requests will be blocked by the web browser. (This is a security feature built into web browsers.) Therefore, you must go to the <code>http</code> version of this website to interact with <code>http</code> IOTA servers.
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="openHTTPSite">OK</button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </b-modal>

  </div>
</template>

<script>
  import IOTA from 'iota.lib.js'
  import ValueHelper from './components/mixins/ValuesHelper'
  import BModal from 'buefy/src/components/modal/Modal'

  // public node list from IOTA's mainnet nodes, https://iotasupport.com/providers.json, and http://iotanode.host/
  const defaultProviderList = [
    // http nodes
    'http://eugene.iota.community:14265',
    'http://node01.iotatoken.nl:14265',
    'http://node02.iotatoken.nl:14265',
    'http://node03.iotatoken.nl:14265',
    'http://mainnet.necropaz.com:14500',
    'http://node.lukaseder.de:14265',
    'http://iota-node-nelson.prizziota.com:80',
    // https nodes
    'https://iota-node-nelson.prizziota.com:443',
    'https://iotanode.us:443',
    'https://iri2-api.iota.fm:443',
    'https://iri3-api.iota.fm:443',
    'https://nelson1-api.iota.fm:443',
    'https://node.iota-community.org:443',
    'https://node.iota.dance:443',
    'https://node.neffware.com:443',
    'https://node1.iotaner.org:443',
    'https://nodes.iota.cafe:443',
    'https://wallet1.iota.town:443',
    'https://wallet2.iota.town:443'
  ]

  const initialProvider = 'https://iota-node-nelson.prizziota.com:443'

  export default {
    components: {BModal},
    name: 'app',
    mixins: [ValueHelper],
    data () {
      return {
        navVisible: false,
        customProvider: '',
        donationAddress: 'Coming soon...',
        providerList: defaultProviderList,
        iota: {
          status: '',
          link: null,
          provider: initialProvider,
          connected: false,
          latestMilestone: '',
          latestSolidMilestone: '',
          latestMilestoneIndex: 0,
          latestSolidSubtangleMilestoneIndex: 0
        },
        isProviderModalActive: false,
        intendedHTTPSite: null
      }
    },
    computed: {
      providerHealth () {
        return this.iota.latestSolidSubtangleMilestoneIndex + ' / ' + this.iota.latestMilestoneIndex
      }
    },
    methods: {
      addProvider () {
        if(this.customProvider) {
          this.providerList.push(this.customProvider)
          this.customProvider = ''
        }
      },
      connectToIOTA () {
        // if(window.location.protocol.includes('http:')) {
        if(window.location.protocol.includes('https:') && this.iota.provider.includes('http:')) {
          this.intendedHTTPSite = this.iota.provider
          this.isProviderModalActive = true
          // FIXME: this.iota.provider is stale
          // this.iota.provider = this.iota.link.provider ?
          return
        }

        this.iota.status = 'Connecting' // TODO: rename this.iota to this.iotaConnectionController
        this.iota.connected = false
        this.iota.latestMilestoneIndex = 0
        this.iota.latestSolidSubtangleMilestoneIndex = 0
        this.iota.version = null

        this.iota.link = new IOTA({
          provider: this.iota.provider
        })

        let currentLink = this.iota.link

        this.iota.link.api.getNodeInfo((err, success) => {
          if(currentLink !== this.iota.link) { return }
          if (err) {
            this.iota.status = 'Failed'
            return
          }
          this.iota.status = 'Connected'
          this.iota.connected = true
          this.iota.latestMilestone = success.latestMilestone
          this.iota.latestSolidMilestone = success.latestSolidSubtangleMilestone
          this.iota.latestMilestoneIndex = success.latestMilestoneIndex
          this.iota.latestSolidSubtangleMilestoneIndex = success.latestSolidSubtangleMilestoneIndex
          this.iota.version = success.appVersion
        })
      },
      openHTTPSite() {
        this.isProviderModalActive = false
        window.open(window.location.href.replace('https:', 'http:'), '_blank')
      },
      closeModal() {
        this.isProviderModalActive = false
      }
    },
    mounted () {
      this.connectToIOTA()
    }
  }
</script>

