import { ethers } from "ethers";
import * as lendingPoolABI from "../assets/lendingPool.abi.json";

const contractIface = new ethers.utils.Interface(lendingPoolABI.abi);

export const eventFilters = (contractAddress: string) => {
  return {
    lendingPool: {
      address: contractAddress,
      topics: [
        [
          contractIface.getEventTopic("Deposit"),
          contractIface.getEventTopic("Borrow"),
          contractIface.getEventTopic("Repay"),
          contractIface.getEventTopic("Withdraw"),
          contractIface.getEventTopic("LiquidationCall"),
        ],
      ],
    },
  };
};
