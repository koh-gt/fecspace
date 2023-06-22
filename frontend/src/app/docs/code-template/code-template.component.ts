import { Component, Input, OnInit } from '@angular/core';
import { Env, StateService } from '../../services/state.service';

@Component({
  selector: 'app-code-template',
  templateUrl: './code-template.component.html',
  styleUrls: ['./code-template.component.scss']
})
export class CodeTemplateComponent implements OnInit {
  @Input() network: string;
  @Input() code: any;
  @Input() hostname: string;
  @Input() baseNetworkUrl: string;
  @Input() method: 'GET' | 'POST' | 'websocket' = 'GET';
  @Input() showCodeExample: any;
  env: Env;

  constructor(
    private stateService: StateService,
  ) { }

  ngOnInit(): void {
    this.env = this.stateService.env;
  }

  adjustContainerHeight( event ) {
    if( ( window.innerWidth <= 992 ) && ( this.method !== 'websocket' ) ) {
      const urlObj = new URL( window.location + '' );
      const endpointContainerEl = document.querySelector<HTMLElement>( urlObj.hash );
      const endpointContentEl = document.querySelector<HTMLElement>( urlObj.hash + ' .endpoint-content' );
      window.setTimeout( function() {
        endpointContainerEl.style.height = endpointContentEl.clientHeight + 90 + 'px';
      }, 550);
    }
  }

  npmGithubLink(){
    const npmLink = `https://github.com/mempool/mempool.js`;
    return npmLink;
  }

  npmModuleLink() {
    const npmLink = `https://www.npmjs.org/package/@mempool/mempool.js`;
    return npmLink;
  }

  normalizeHostsESModule(codeText: string) {
    if (this.env.BASE_MODULE === 'mempool') {
      codeText = codeText.replace('%{0}', 'bitcoin');
      if(['', 'main'].includes(this.network)) {
        codeText = codeText.replace('mempoolJS();', `mempoolJS({
    hostname: '${document.location.hostname}'
  });`);
      } else {
        codeText = codeText.replace('mempoolJS();', `mempoolJS({
    hostname: '${document.location.hostname}',
    network: '${this.network}'
  });`);
      }
    }
    return codeText;
  }

  normalizeHostsCommonJS(codeText: string) {
    if (this.env.BASE_MODULE === 'mempool') {
      codeText = codeText.replace('%{0}', 'bitcoin');
      if(['', 'main'].includes(this.network)) {
        codeText = codeText.replace('mempoolJS();', `mempoolJS({
          hostname: '${document.location.hostname}'
        });`);
      } else {
        codeText = codeText.replace('mempoolJS();', `mempoolJS({
          hostname: '${document.location.hostname}',
          network: '${this.network}'
        });`);
      }
    }
    return codeText;
  }

  wrapEsModule(code: any) {
    let codeText: string;
    if (code.codeTemplate) {
      codeText = this.normalizeHostsESModule(code.codeTemplate.esModule);

      if(this.network === '' || this.network === 'main') {
        codeText = this.replaceJSPlaceholder(codeText, code.codeSampleMainnet.esModule);
      }
      if (this.network === 'testnet') {
      codeText = this.replaceJSPlaceholder(codeText, code.codeSampleTestnet.esModule);
      }

      const importText = `import mempoolJS from "@mempool/mempool.js";`;

      return `${importText}

const init = async () => {
  ${codeText}
};

init();`;
    }
  }

  wrapCommonJS(code: any) {
    let codeText: string;
    if (code.codeTemplate) {
      codeText = this.normalizeHostsCommonJS(code.codeTemplate.commonJS);

      if(this.network === '' || this.network === 'main') {
        codeText = this.replaceJSPlaceholder(codeText, code.codeSampleMainnet.esModule);
      }
      if (this.network === 'testnet') {
      codeText = this.replaceJSPlaceholder(codeText, code.codeSampleTestnet.esModule);
      }

      if (code.noWrap) {
        return codeText;
      }

      const importText = `<script src="https://litecoinspace.org/mempool.js"></script>`;

      let resultHtml = '<pre id="result"></pre>';
      if (this.method === 'websocket') {
        resultHtml = `<h2>Blocks</h2><pre id="result-blocks">Waiting for data</pre><br>
    <h2>Mempool Info</h2><pre id="result-mempool-info">Waiting for data</pre><br>
    <h2>Transactions</h2><pre id="result-transactions">Waiting for data</pre><br>
    <h2>Mempool Blocks</h2><pre id="result-mempool-blocks">Waiting for data</pre><br>`;
      }

      return `<!DOCTYPE html>
<html>
  <head>
    ${importText}
    <script>
      const init = async () => {
        ${codeText}
      };
      init();
    </script>
  </head>
  <body>
    ${resultHtml}
  </body>
</html>`;
    }
  }

  wrapImportTemplate() {

    const importTemplate = `# npm
npm install @mempool/mempool.js --save

# yarn
yarn add @mempool/mempool.js`;

    return importTemplate;
  }

  wrapCurlTemplate(code: any) {
    if (code.codeTemplate) {
      if (this.network === 'testnet') {
        return this.replaceCurlPlaceholder(code.codeTemplate.curl, code.codeSampleTestnet);
      }
      if (this.network === '' || this.network === 'main') {
        return this.replaceCurlPlaceholder(code.codeTemplate.curl, code.codeSampleMainnet);
      }
    }
  }

  wrapResponse(code: any) {
    if (this.method === 'websocket') {
      return '';
    }
    if (this.network === 'testnet') {
      return code.codeSampleTestnet.response;
    }
    return code.codeSampleMainnet.response;
  }

  wrapPythonTemplate(code: any) {
    return ( ( this.network === 'testnet' ) ? ( code.codeTemplate.python.replace( 'wss://litecoinspace.org/api/v1/ws', 'wss://litecoinspace.org/' + this.network + '/api/v1/ws' ) ) : code.codeTemplate.python );
  }

  replaceJSPlaceholder(text: string, code: any) {
    for (let index = 0; index < code.length; index++) {
      const textReplace = code[index];
      const indexNumber = index + 1;
      text = text.replace('%{' + indexNumber + '}', textReplace);
    }
    return text;
  }

  replaceCurlPlaceholder(curlText: any, code: any) {
    let text = curlText;
    text = text.replace( '[[hostname]]', this.hostname );
    text = text.replace( '[[baseNetworkUrl]]', this.baseNetworkUrl );
    for (let index = 0; index < code.curl.length; index++) {
      const textReplace = code.curl[index];
      const indexNumber = index + 1;
      text = text.replace('%{' + indexNumber + '}', textReplace);
    }

    if (this.env.BASE_MODULE === 'mempool') {
      if (this.network === 'main' || this.network === '') {
        if (this.method === 'POST') {
          return `curl -X POST -sSLd "${text}"`;
        }
        return `curl -sSL "${this.hostname}${text}"`;
      }
      if (this.method === 'POST') {
        return `curl -X POST -sSLd "${text}"`;
      }
      return `curl -sSL "${this.hostname}/${this.network}${text}"`;
    } else {
        return `curl -sSL "${this.hostname}${text}"`;
    }

  }

}
