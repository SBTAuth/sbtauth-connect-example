import { SbtAuthWallet } from '@sbtauth/sbtauth-wallet'
import { ethers } from 'ethers'
import './style.css'

// Initialize sbtauth
const sbtauth = new SbtAuthWallet({
	developMode: true,
	defaultChainId: '0x5',
})

const connectButton = document.querySelector('#connect')
const connectLoading = document.querySelector('#connect-loading') as HTMLElement
connectButton?.addEventListener('click', async () => {
	connectLoading.hidden = false
	await sbtauth.login()
	connectLoading.hidden = true
	window.alert('Login successfully')
})

const logoutButton = document.querySelector('#logout')
const logoutLoading = document.querySelector('#logout-loading') as HTMLElement
logoutButton?.addEventListener('click', async () => {
	logoutLoading.hidden = false
	await sbtauth.logout()
	logoutLoading.hidden = true
})

const disconnectButton = document.querySelector('#disconnect')
disconnectButton?.addEventListener('click', () => {
	sbtauth.disconnect()
})

const getUserInfoButton = document.querySelector('#getUserInfo')
getUserInfoButton?.addEventListener('click', () => {
	const user = sbtauth.getUserInfo()
	window.alert(JSON.stringify(user))
})

const getAccountButton = document.querySelector('#getAccount')
getAccountButton?.addEventListener('click', () => {
	if (!sbtauth) return
	const address = sbtauth.provider?.accounts[0]
	window.alert(address)
})

const getBalanceButton = document.querySelector('#getBalance')
getBalanceButton?.addEventListener('click', async () => {
	console.log(sbtauth.provider)
	if (!sbtauth.provider) return
	const provider = new ethers.providers.Web3Provider(sbtauth.provider)
	const address = sbtauth.provider.accounts[0]
	const balance = await provider.getBalance(address)
	window.alert(balance)
})

const signMessageButton = document.querySelector('#signMessage')
signMessageButton?.addEventListener('click', async () => {
	console.log(sbtauth)

	if (!sbtauth.provider) return
	const provider = new ethers.providers.Web3Provider(sbtauth.provider)
	const signer = provider.getSigner()
	console.log(signer.getAddress())
	const signature = await signer.signMessage('Test messsage')
	window.alert(signature)
})
