import { contractAddresses, abi } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  const dispatch = useNotification();

  const {
    runContractFunction: enterRaffle,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    msgValue: entranceFee,
    params: {},
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUIValues() {
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    const numPlayersFromCall = (await getNumberOfPlayers()).toString();
    const recentWinnerFromCall = await getRecentWinner();
    setEntranceFee(entranceFeeFromCall);
    setNumberOfPlayers(numPlayersFromCall);
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleSuccess = async (tx) => {
    await tx.wait();
    updateUIValues();
    handleNewNotification(tx);
  };

  return (
    <div>
      <h1>Lottery</h1>
      {raffleAddress ? (
        <>
          <button
            onClick={async () =>
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? null : "Enter Raffle"}
          </button>
          <div>
            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <br />
          <div>The current number of players is: {numberOfPlayers}</div>
          <br />
          <div>The most previous winner was: {recentWinner}</div>
        </>
      ) : (
        <div>Please connect to a supported chain</div>
      )}
    </div>
  );
}
