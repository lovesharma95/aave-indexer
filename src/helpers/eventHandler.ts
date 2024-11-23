import { ethers } from "ethers";

import * as lendingPoolABI from "../assets/lendingPool.abi.json";
import * as aUsdcABI from "../assets/aUsdc.abi.json";
import AccoutService from "../services/accountService";

const contractIface = new ethers.utils.Interface(lendingPoolABI.abi);

export async function eventHandler(
  event: any,
  aUsdcAddress: string,
  lendingPoolAddress: string,
  webSocketUrl: string
) {
  try {
    // Get the event signature from the first topic
    const eventSignature = event.topics[0];

    // Map of event signatures to their respective event names
    const eventMapping: { [signature: string]: string } = {
      [contractIface.getEventTopic("Deposit")]: "Deposit",
      [contractIface.getEventTopic("Borrow")]: "Borrow",
      [contractIface.getEventTopic("Repay")]: "Repay",
      [contractIface.getEventTopic("Withdraw")]: "Withdraw",
      [contractIface.getEventTopic("LiquidationCall")]: "LiquidationCall",
    };

    // Check if the event signature exists in the mapping
    const eventName = eventMapping[eventSignature];

    if (!eventName) {
      console.warn("Unknown event type received:", eventSignature);
      return null;
    }

    // Decode the event log
    const decodedEventData = contractIface.decodeEventLog(
      eventName,
      event.data,
      event.topics
    );

    // Add decoded data and event type to the event object
    event["type"] = eventName;
    event["args"] = decodedEventData;

    const provider = new ethers.providers.WebSocketProvider(webSocketUrl);

    const receipt = await provider.getTransactionReceipt(event.transactionHash);

    // Check if the receipt logs interact with the target contract address
    const interactsWithTargetContract = receipt.logs.some(
      (log) => log.address.toLowerCase() === aUsdcAddress.toLowerCase()
    );

    if (!interactsWithTargetContract) {
      // console.log(
      //   "Event does not interact with the target contract, skipping."
      // );
      return null; // Skip events that do not interact with the target contract
    }

    const contract = new ethers.Contract(
      event.address,
      lendingPoolABI.abi,
      provider
    );

    const userData = await contract.getUserAccountData(event["args"]["user"]);

    const userDecodedData = {
      userAddress: event["args"]["user"],
      totalCollateralETH: ethers.utils.formatEther(
        BigInt(userData["totalCollateralETH"]._hex)
      ),
      totalDebtETH: ethers.utils.formatEther(
        BigInt(userData["totalDebtETH"]._hex)
      ),
      availableBorrowsETH: ethers.utils.formatEther(
        BigInt(userData["availableBorrowsETH"]._hex)
      ),
      currentLiquidationThreshold: ethers.utils.formatEther(
        BigInt(userData["currentLiquidationThreshold"]._hex)
      ),
      ltv: ethers.utils.formatEther(BigInt(userData["ltv"]._hex)),
      healthFactor: ethers.utils.formatEther(
        BigInt(userData["healthFactor"]._hex)
      ),
    };

    const minHealthFactor = 1.05;
    if (parseFloat(userDecodedData.healthFactor) < minHealthFactor) {
      // notification alert
      console.log(
        `⚠️  ALERT: Account ${userDecodedData.userAddress} has a Health Factor of ${userDecodedData.healthFactor}. Immediate action required.`
      );
    }

    console.log(
      `✅  Success: Account ${userDecodedData.userAddress} has valid Health Factor. Saving Data!!!`
    );

    // DB Calls
    const accountService = new AccoutService();
    const account = await accountService.get(userDecodedData.userAddress);
    if (!account) {
      await accountService.create(userDecodedData);
    } else {
      await accountService.update(userDecodedData, account);
    }

    return userDecodedData;
  } catch (error: any) {
    console.error("Error in Event Handler: ", error.message);
  }
}
