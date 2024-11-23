import { eventFilters } from "../helpers/eventFilters";
import { eventHandler } from "../helpers/eventHandler";
import { getPastEvents } from "./getPastEvents";

export async function getMissedMultiSendTransaction(
  chain: string,
  block: number,
  aUsdcAddress: string,
  lendingPoolAddress: string,
  webSocketUrl: string
) {
  try {
    const eventFilter = eventFilters(lendingPoolAddress);
    const response: any = await getPastEvents(
      eventFilter.lendingPool,
      lendingPoolAddress,
      block,
      webSocketUrl
    );
    const transactionHashes = [];

    for (const event of response.events) {
      try {
        let response = await eventHandler(
          event,
          aUsdcAddress,
          lendingPoolAddress,
          webSocketUrl
        );
        if (response) {
          transactionHashes.push(event.transactionHash);
        }
      } catch (error) {
        console.error(error);
      }
    }

    console.log(
      "Transaction hashes of missed events added: ",
      transactionHashes
    );
    console.log("Total missed events added: ", transactionHashes.length);
    console.log(
      `Events added between blocks: ${response.startBlockNumber} and ${response.endBlockNumber}`
    );

    return {
      totalReimburse: transactionHashes.length,
      transactionHashes: transactionHashes,
      startBlock: response.startBlockNumber,
      endBlock: response.endBlockNumber,
    };
  } catch (error: any) {
    console.error("getMissedMultiSendTransactions: ", error.message);
  }
}
