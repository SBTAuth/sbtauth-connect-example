import { SbtAuthWallet } from "@sbtauth/sbtauth-wallet";
import { ethers } from "ethers";
import "./style.css";

const abi = [
  {
    inputs: [
      { internalType: "address", name: "recommender", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "string", name: "name", type: "string" },
    ],
    name: "register",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "payable",
    type: "function",
  },
];
const contractAddress = "0xee68a176176AF73C5A1e341F0F6fD1f58a42fFBb";

// Initialize sbtauth
const sbtauth = new SbtAuthWallet({
  developMode: true,
  defaultChainId: "0x5",
  targetUrl: 'https://test-connect.sbtauth.io'
});

const connectButton = document.querySelector("#connect");
const connectLoading = document.querySelector(
  "#connect-loading"
) as HTMLElement;
connectButton?.addEventListener("click", async () => {
  connectLoading.hidden = false;
  await sbtauth.login();
  connectLoading.hidden = true;
  window.alert("Login successfully");
});

const logoutButton = document.querySelector("#logout");
const logoutLoading = document.querySelector("#logout-loading") as HTMLElement;
logoutButton?.addEventListener("click", async () => {
  logoutLoading.hidden = false;
  await sbtauth.logout();
  logoutLoading.hidden = true;
});

const disconnectButton = document.querySelector("#disconnect");
disconnectButton?.addEventListener("click", () => {
  sbtauth.disconnect();
});

const getUserInfoButton = document.querySelector("#getUserInfo");
getUserInfoButton?.addEventListener("click", () => {
  const user = sbtauth.getUserInfo();
  window.alert(JSON.stringify(user));
});

const getAccountButton = document.querySelector("#getAccount");
getAccountButton?.addEventListener("click", () => {
  if (!sbtauth) return;
  const address = sbtauth.provider?.accounts[0];
  window.alert(address);
});

const getBalanceButton = document.querySelector("#getBalance");
getBalanceButton?.addEventListener("click", async () => {
  console.log(sbtauth.provider);
  if (!sbtauth.provider) return;
  const provider = new ethers.providers.Web3Provider(sbtauth.provider);
  const address = sbtauth.provider.accounts[0];
  const balance = await provider.getBalance(address);
  window.alert(balance);
});

const signMessageButton = document.querySelector("#signMessage");
signMessageButton?.addEventListener("click", async () => {
  if (!sbtauth.provider) return;
  const provider = new ethers.providers.Web3Provider(sbtauth.provider);
  const signer = provider.getSigner();
  console.log(signer.getAddress());
  const signature = await signer.signMessage("Test messsage");
  window.alert(signature);
});

const registerDomainButton = document.querySelector("#registerDomain");
const registerLoading = document.querySelector(
  "#register-loading"
) as HTMLElement;
function getRandomInt(value: number) {
  return Math.floor(Math.random() * value);
}
registerDomainButton?.addEventListener("click", async () => {
  if (!sbtauth.provider) return;

  registerLoading.hidden = false;
  const provider = new ethers.providers.Web3Provider(sbtauth.provider);
  const signer = provider.getSigner();
  const address = signer.getAddress();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const randomDomain = Array.from({ length: 6 }, () => getRandomInt(10)).join(
    ""
  );
  const recommander = "0x8316E9B2789A7CC3e61C80B6bab9A6E1735701B2";
  try {
    const result = await contract.register(recommander, address, randomDomain, {
      value: ethers.utils.parseUnits("0.06"),
      gasPrice: ethers.utils.parseUnits("50", '9')
    });
    console.log(result.hash);
    // const receipt = await result.wait();
    window.alert(
      `Congratualations! ${randomDomain} registered! Transaction hash ${result.hash}`
    );
  } catch (error) {
    window.alert(error);
  } finally {
    registerLoading.hidden = true;
  }
});
