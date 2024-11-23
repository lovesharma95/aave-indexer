import { ethers } from "ethers";
import * as lendingPoolABI from "../assets/lendingPool.abi.json";

export async function getPastEvents(
  eventFilter: {
    address: string;
    topics: string[][];
  },
  contractAddress: string,
  startBlockNumber: number,
  webSocketUrl: string
) {
  try {
    const provider = new ethers.providers.WebSocketProvider(webSocketUrl);
    let contractABI = lendingPoolABI.abi;
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    const blockNo = startBlockNumber;
    if (blockNo === null) {
      console.log("Received null from db for last block number!");
      return;
    }
    // Get latest block number from network.
    const currentBlock = await provider.getBlockNumber();

    // Query all events with eventFilter between the two block numbers.
    let queriedEvents: any = [];
    if (currentBlock - blockNo <= 2000) {
      queriedEvents = await contract.queryFilter(
        eventFilter,
        blockNo,
        currentBlock
      );
    } else {
      let start = blockNo;
      let end = blockNo + 2000;
      while (start < currentBlock) {
        let events = await contract.queryFilter(eventFilter, start, end);
        start = end + 1;
        end = start + 2000 < currentBlock ? start + 2000 : currentBlock;
        queriedEvents = [...queriedEvents, ...events];
      }
    }

    return {
      events: queriedEvents,
      startBlockNumber: blockNo,
      endBlockNumber: currentBlock,
    };
  } catch (error: any) {
    console.log("getPastEvents: ", error.message);
    throw new Error(error);
  }
}
