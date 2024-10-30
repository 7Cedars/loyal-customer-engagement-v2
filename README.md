
<a name="readme-top"></a>

[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/7Cedars/loyal-customer-engagement-v2"> 
    <img src="./nextjs/customer-app/public/logo.png" alt="Logo" width="200" height="200">
  </a>

<h3 align="center">Loyal: Web3 Customer Engagement that Works </h3>

  <p align="center">
    A composable solidity protocol and lightweight dApp for real-world customer engagement. 
    <br />
    <br />
    <!--NB: TO DO --> 
    <a href="/foundry">Solidity protocol</a> ·
    <a href="/nextjs/vendor-app/">Vendor dApp</a> ·
    <a href="/nextjs/customer-app/">Customer dApp</a> ·
    <a href="https://clpv.vercel.app">Deploy a Loyalty Program</a>
  </p>
</div>

<!-- TABLE OF CONTENTS --> 
<!-- NB! Still needs to be adapted --> 
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about">About</a>
      <ul>
        <li><a href="#the-problem">The problem</a></li>
        <li><a href="#solutions">Solutions</a></li>
        <li><a href="#concepts">Concepts</a></li>
        <li><a href="#how-it-works">How it works</a></li>
        <li><a href="#important-files-and-folders">Important files and folders</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About
The Loyal protocol provides a modular, composable and gas efficient framework for blockchain based customer engagement programs. 

- It uses a bespoke implementation of ERC-4337 Account Abstraction to abstract away any blockchain interaction from customers, while greatly simplifying setting up a paying account for vendors.    
- It uses an ERC-20 token as loyalty points, allowing loyalty programs to access a global pool of loyalty gift contracts. Meanwhile, it retains exclusivity by linking points and gift vouchers to their parent loyalty program.

<b> IMPORTANT: Do not use this project in any kind of production setting. </b> The project is meant as a Proof of Concept for a new kind of blockchain based customer engagement programs. The code is in active development and has not been audited. It has only been deployed on a testnet - for good reason. 

### The problem 
The use of blockchains for points based customer programs has been explored extensively. Blockchains potentially allow  <!-- Here add some refs -->
- Dynamic customer experiences that are truly global.
- Transparency and interoperability between engagement programs.   
- A more intimate customer experience with ownership of vouchers and points transferred from the vendor to the customer.  

They have not yet been widely used though. 
1. Blockchain interactions used to be too expensive for these uses cases.  
2. Interaction with blockchains through web3 wallets is too cumbersome for most customers. 
3. Tokens on blockchains can be used from one program to another. This goes against exclusivity of customer loyalty programs.

### Solutions
1. The cost of blockchain interactions on most L2 chains has dropped dramatically, making this use case viable. 

2. Loyal uses a bespoke implementation of ERC-4337 Account Abstraction. 
   - Every Loyalty Card is a bespoke account abstraction that can only interact with its parent Loyalty Program. 
   - The parent Loyalty Program pays for all interactions of its Loyalty Cards. 
   - The Loyal protocol avoids setting up a complex paymaster-account workflow, while still retaining necessary protocol security.    

3. The Loyal protocol strikes a balance between interoperability and exclusivity in loyalty programs. 
   -  Loyal **allows** anyone to act as a vendor, deploying a loyalty program, minting loyalty points and cards, and distributing points to loyalty cards. 
   -  Loyal **allows** anyone to deploy gifts that exchange loyalty points for gift vouchers. 
   -  Loyal **disallows** the use of loyalty points and vouchers in any other loyalty program than the one in which they were minted.

In short, gift contracts can be used across programs to exchange points; but points and gifts themselves are exclusive to programs.

### Concepts
-  _Program_: A contract that creates loyalty cards, distributes (ERC-20) loyalty points, white lists (ERC-721) loyalty gift and mints their gift vouchers. 
-  _Gift_: A contract that receives loyalty points and exchanges them for an gift voucher. Gift contracts are interoperable, but their vouchers are program exclusive.  
-  _Card_: An account abstraction that can only interact with the Loyalty Program that created it. All its transactions are funded by the Loyalty program. 


### How it works
Loyalty Programs (ERC-20)
- Are given a practically endless amount of loyalty points at construction. 
- Can whitelist loyalty gifts. 
- Automatically creates new loyalty cards every time a new account calls `requestPoints`. 
- Can disallow the creation of new loyalty cards.  <!-- Check if this actually works -->

Loyalty Gifts (ERC-721) 
- Allow Loyalty Programs to mint gift vouchers. 
- Have a `requirementsExchangeMet` function that checks if a loyalty card meets requirements for exchange of points to a gift voucher. The requirement logic can be anything: number pf points, time of day, randomisation, anything goes. 
- Have a `requirementsRedeemMet` function that checks if a loyalty card meets requirements for exchange of a gift voucher to a gift. Again, any logic goes.  

Loyalty Cards (ERC-4337)
- Are bespoke Account Abstractions that are only allowed to interact with their parent loyalty program. 
- They can also only interact with white listed gift contracts. 
- They can collect points, exchange points for gift vouchers and exchange vouchers for actual gifts at the vendor. 
- All interactions are paid for by the parent loyalty contract.  

A simplified flowchart 
  <a href="https://github.com/7Cedars/loyal-customer-engagement-v2/blob/master/public/flowchart loyalty_program.png"> 
    <img src="public/flowchart loyalty_program.png" alt="Schema Protocol" width="100%" height="100%">
  </a>

### Legacy projects
This project emerged from a previous loyalty program, build on the ERC-6551 token based account standard. See the following repositories: 
- [Solidity Protocol](https://github.com/7Cedars/loyalty-program-contracts) 
- [Solidity Gift Contracts](https://github.com/7Cedars/loyalty-gifts-contracts)
- [Front end UI/UX](https://github.com/7Cedars/loyalty-program-next)  

### Important files and folders

```
.
|
├── foundry               # Contains all the contracts, interfaces and tests. 
│    ├── README.md        # All information needed to run contracts locally, test and deploy contracts.   
│    └── ...                     
| 
├── nextjs                # App workspace
|     ├── customer-app    # Project documentation for customer-app
|     │    ├── README.md   
|     │    └── ...   
│     └── vendor-app 
|          ├── README.md  # Project documentation for vendor-app 
│          └── ...   
│
├── public                # Images
│    └── ...   
|
├── LICENSE
└── README.md             # Project documentation.
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With
<!-- See for a list of badges: https://github.com/Envoy-VC/awesome-badges -->
<!-- * [![React][React.js]][React-url]  -->
* Solidity 0.8.26
* Foundry 0.2.0
* OpenZeppelin 5.0.2
* Eth-infinitism account-abstraction v0.7.0
* React 18
* NextJS 14
* Wagmi / viem
* Pimlico permisionless.js 
* Reown appkit v1.1.7 (previously walletConnect)
* Privy.io
* Tailwind css

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Seven Cedars - [Github profile](https://github.com/7Cedars) - cedars7@proton.me

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[issues-shield]: https://img.shields.io/github/issues/7Cedars/loyalty-program-contracts.svg?style=for-the-badge
[issues-url]: https://github.com/7Cedars/loyalty-program-contracts/issues/
[license-shield]: https://img.shields.io/github/license/7Cedars/loyalty-program-contracts.svg?style=for-the-badge
[license-url]: https://github.com/7Cedars/loyalty-program-contracts/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
<!-- See list of icons here: https://hendrasob.github.io/badges/ -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind-css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Redux]: https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white
[Redux-url]: https://redux.js.org/
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
