import { encrypt } from '@metamask/eth-sig-util'
import { Chain } from '@sbtauth/common'
import { SbtAuthWallet } from '@sbtauth/sbtauth-wallet'
import { ethers } from 'ethers'
import './style.css'

// Initialize sbtauth
const sbtauth = new SbtAuthWallet({
	developMode: true,
	defaultChainId: '0x5',
	uiConfig: {
		theme: 'light',
		locale: 'zh-TW',
		showWallets: false,
	},
	targetUrl: "https://test-connect.sbtauth.io",
	supportChains: [Chain.bitcoin],
})
const icon = SbtAuthWallet.icon

const logo = document.querySelector('#logo') as HTMLImageElement
logo.src = icon

const loginWidget = sbtauth.provider?.loginWidget()

if (loginWidget) {
	document.querySelector('#sbtauth-login')?.append(loginWidget)
}
const walletActions = document.querySelector('#wallet-actions') as HTMLElement
const walletLogin = document.querySelector('#sbtauth-login') as HTMLElement
walletActions.style.display = 'none'

sbtauth.provider.on('accountsChanged', async (data: string[] | undefined) => {
	console.log('connected', data)
	if (data && data.length > 0) {
		walletActions.style.display = 'grid'
		walletLogin.style.display = 'none'
		const result = await sbtauth.provider.request({
			method: 'eth_login_silent',
			params: ['test'],
		})
		console.log('returned result', { result })
	}
})

sbtauth.provider.on('disconnect', async () => {
	walletActions.style.display = 'none'
	walletLogin.style.display = 'block'
	const loginWidget = sbtauth.provider?.loginWidget()
	if (loginWidget) {
		walletLogin?.replaceChild(walletLogin.firstChild!, loginWidget)
	}
})

const connectButton = document.querySelector('#connect')
const connectLoading = document.querySelector('#connect-loading') as HTMLElement
connectButton?.addEventListener('click', async () => {
	connectLoading.hidden = false
	await sbtauth.login()
	connectLoading.hidden = true
	sbtauth.provider?.on('logout', () => {
		window.alert('SBTAuth disconnected')
	})
	window.alert('Login successfully')
})

const disconnectButton = document.querySelector('#disconnect')
disconnectButton?.addEventListener('click', async () => {
	sbtauth.disconnect()
	walletActions.style.display = 'none'
	walletLogin.style.display = 'block'
	const loginWidget = sbtauth.provider?.loginWidget()
	if (loginWidget) {
		walletLogin?.replaceChild(walletLogin.firstChild!, loginWidget)
	}
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

const encryptMessage = (publicKey: string) => {
	const encrypted = encrypt({ publicKey, data: 'Hello world', version: 'x25519-xsalsa20-poly1305' })
	return '0x' + Buffer.from(JSON.stringify(encrypted), 'utf8').toString('hex')
}
const getEncryptionPublicKyeButton = document.querySelector('#getEncryptionPublicKey')
getEncryptionPublicKyeButton?.addEventListener('click', async () => {
	if (!sbtauth.provider) return
	const pubkey = await sbtauth.provider.request({ method: 'eth_getEncryptionPublicKey' })
	const element = document.querySelector('#testEncryptData')
	element!.innerHTML = 'Encrypted "Hello world" \n' + encryptMessage(pubkey)
	window.alert(pubkey)
})

const decryptMessageButton = document.querySelector('#ethDecrypt')
decryptMessageButton?.addEventListener('click', async () => {
	if (!sbtauth.provider) return
	const message = prompt("What's your encrypted message?")
	const decryptedMessage = await sbtauth.provider.request({ method: 'eth_decrypt', params: [message] })
	window.alert(decryptedMessage)
})

const signTransactionButton = document.querySelector('#signTransaction')
signTransactionButton?.addEventListener('click', async () => {
	console.log(sbtauth)
	if (!sbtauth.provider) return
	const provider = new ethers.providers.Web3Provider(sbtauth.provider)
	const signer = provider.getSigner()
	console.log(signer.getAddress())
	const abi = [
		'function transfer(address to, uint amount) returns (bool)',
		'event Transfer(address indexed from, address indexed to, uint amount)',
	]

	const address = '0xff04b6fBd9FEcbcac666cc0FFfEed58488c73c7B'
	const erc20 = new ethers.Contract(address, abi, signer)
	await erc20.transfer('ricmoo.eth', ethers.utils.parseUnits('1.23'))
})

const getBitcoinAccountButton = document.querySelector('#getBitcoinAccount')
getBitcoinAccountButton?.addEventListener('click', async () => {
	if (!sbtauth.provider.bitcoinProvider) {
		return
	}
	const bitcoinAddress = sbtauth.provider.bitcoinProvider!.accounts[0]
	window.alert(bitcoinAddress)
})

const getBitcoinBalanceButton = document.querySelector('#getBitcoinBalance')
getBitcoinBalanceButton?.addEventListener('click', async () => {
	if (!sbtauth.provider.bitcoinProvider) return
	const value = await sbtauth.provider.bitcoinProvider.getBalance()
	window.alert(value)
})

const signBitcoinTransactionButton = document.querySelector('#signBitcoinTransaction')
signBitcoinTransactionButton?.addEventListener('click', async () => {
	if (!sbtauth.provider.bitcoinProvider) {
		return
	}
	const transaction = {
		to: 'tb1qyp4y9lf30hcvkm5rac3vl33qwhrnyuy07fepx7',
		value: 10_000,
		feeRate: 100,
	}
	try {
		const signature = await sbtauth.provider.bitcoinProvider!.sendTransaction(transaction)
		window.alert(signature)
	} catch (error) {
		window.alert(error)
	}
})
