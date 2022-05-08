import { ethers } from "hardhat"

async function main() {
  const HexaToken = await ethers.getContractFactory("HexaToken")
  console.log('Deploying HexaToken ERC721 token...')
  const token = await HexaToken.deploy('HexaToken','HEXA')

  await token.deployed()
  console.log("HexaToken deployed to:", token.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
