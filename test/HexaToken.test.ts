// test/HexaToken.test.ts
import { expect } from "chai"
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { HexaToken } from  "../typechain"

const base64 = require( "base-64")

const _name='HexaToken'
const _symbol='HEXA'

describe("HexaToken", function () {
  let hexa:HexaToken
  let account0:Signer,account1:Signer
  
  beforeEach(async function () {
    [account0, account1] = await ethers.getSigners()
    const HexaToken = await ethers.getContractFactory("HexaToken")
    hexa = await HexaToken.deploy(_name,_symbol)
  })

  it("Should has the correct name and symbol ", async function () {
    expect(await hexa.name()).to.equal(_name)
    expect(await hexa.symbol()).to.equal(_symbol)
  })

  it("Should tokenId start from 1 and auto increment", async function () {
    const address1=await account1.getAddress()
    await hexa.mintTo(address1)
    expect(await hexa.ownerOf(1)).to.equal(address1)

    await hexa.mintTo(address1)
    expect(await hexa.ownerOf(2)).to.equal(address1)
    expect(await hexa.balanceOf(address1)).to.equal(2)
  })

  it("Should mint a token with event", async function () {
    const address1=await account1.getAddress()
    await expect(hexa.mintTo(address1))
      .to.emit(hexa, 'Transfer')
      .withArgs(ethers.constants.AddressZero,address1, 1)
  })

  it("Should mint a token with desired tokenURI (log result for inspection)", async function () {
    const address1=await account1.getAddress()
    await hexa.mintTo(address1)

    const tokenUri = await hexa.tokenURI(1)
    // console.log("tokenURI:")
    // console.log(tokenUri)

    const tokenId = 1
    const data = base64.decode(tokenUri.slice(29))
    const itemInfo = JSON.parse(data)
    expect(itemInfo.name).to.be.equal('HEXA #'+String(tokenId))
    expect(itemInfo.description).to.be.equal('HEXA NFT with on-chain SVG image.')

    const svg = base64.decode(itemInfo.image.slice(26))
    const idInSVG = svg.slice(256,-13)
    expect(idInSVG).to.be.equal(String(tokenId))
    // console.log("SVG image:")
    // console.log(svg)
  })  

  it("Should mint 10 token with desired tokenURI", async function () {
    const address1=await account1.getAddress()
 
    for(let i=1;i<=10;i++){
      await hexa.mintTo(address1)
      const tokenUri = await hexa.tokenURI(i)

      const data = base64.decode(tokenUri.slice(29))
      const itemInfo = JSON.parse(data)
      expect(itemInfo.name).to.be.equal('HEXA #'+String(i))
      expect(itemInfo.description).to.be.equal('HEXA NFT with on-chain SVG image.')

      const svg = base64.decode(itemInfo.image.slice(26))
      const idInSVG = svg.slice(256,-13)
      expect(idInSVG).to.be.equal(String(i))
    }

    expect(await hexa.balanceOf(address1)).to.equal(10)
  })  
})
