import { BigNumber, Signer } from "ethers"
import { ethers } from "hardhat"
// import { base64 } from "ethers/lib/utils"
import { HexaToken, NFTMarketplace } from  "../typechain"
import { tokenAddress, marketAddress } from "./projectsetting";
const base64 = require( "base-64")

const _name='HexaToken'
const _symbol='HEXA'

async function main() {

  let owner:Signer,account1:Signer,otheraccounts:Signer[]
  
  [owner, account1, ...otheraccounts] = await ethers.getSigners()

  const market:NFTMarketplace = await ethers.getContractAt("NFTMarketplace", marketAddress)
  const nft:HexaToken = await ethers.getContractAt("HexaToken", tokenAddress)
  const ownerAddress = await owner.getAddress();
  let balance = await nft.balanceOf(ownerAddress);
  console.log("owner balance", balance);
  var i = BigNumber.from(0);
  while( i < balance) {
    var tokenId = await nft.tokenOfOwnerByIndex(ownerAddress, i);
    const tokenUri = await nft.tokenURI(tokenId)
    console.log("owner ", i, tokenUri);
    i = i.add(1);
  }
  let items = await market.connect(account1).fetchActiveItems()
  let printitems
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,false)})


  console.log("==my list items==")
  items = await market.connect(account1).fetchMyCreatedItems()
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,false)})

  // console.log( await parseItems(items,nft))


  console.log("==address1 purchased items==")
  items = await market.connect(account1).fetchMyPurchasedItems()
  // console.log( await parseItems(items,nft))
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,true)})

}

async function parseItems(items:any,nft:HexaToken) {
  let parsed=  await Promise.all(items.map(async (item:any) => {
    const tokenUri = await nft.tokenURI(item.tokenId)
    return {
      price: item.price.toString(),
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      buyer: item.buyer,
      tokenUri
    }
  }))

  return parsed
}

function printHelper(item:any,flagUri=false,flagSVG=false){
  if(flagUri){
    const {name,description,svg}= parseNFT(item)
    console.log("id & name:",item.tokenId,name)
    if(flagSVG) console.log(svg)
  }else{
    console.log("id       :",item.tokenId)
  }
}

function parseNFT(item:any){
  const data = base64.decode(item.tokenUri.slice(29))
  const itemInfo = JSON.parse(data)
  const svg = base64.decode(itemInfo.image.slice(26))
  return(
    {"name":itemInfo.name,
     "description":itemInfo.description,
     "svg":svg})  
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
