import React, { useEffect, useState } from 'react';
import './App.css';
import { Dev3SDK, KeeperRegistry } from 'dev3-sdk';
import { JsonRpcProvider } from 'ethers';

const sdk = new Dev3SDK(
  "cULb/.NGU7SYhiDF5VlQA0bKK07bV83RMNEj+XcD5KGVu",
  "3141e2b5-7849-47c9-8e0e-7222348f1935"
);

function App () {
  const [keeperRegistry, setKeeperRegistry] = useState(null);
  const [keeperRegistryConfig, setKeeperRegistryConfig] = useState(null);
  const [upkeep, setUpkeep] = useState(null);
  const [inputId, setInputId] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputTargetContract, setInputTargetContract] = useState('');
  const [inputGasLimit, setInputGasLimit] = useState('');
  const [inputAdminAddress, setInputAdminAddress] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputNewAmount, setInputNewAmount] = useState('');
  const [inputNewGasLimit, setInputNewGasLimit] = useState('');
  const [inputOffchainConfig, setInputOffchainConfig] = useState('');
  const [inputAdmin, setInputAdmin] = useState('');
  const [inputWithdrawAddress, setInputWithdrawAddress] = useState('');
  const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
  const [withdrawAvailable, setWithdrawAvailable] = useState(false);
  const [counterVisible, setCounterVisible] = useState(false);
  const provider = new JsonRpcProvider("https://ethereum-sepolia.publicnode.com");

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (upkeep) {
      const interval = setInterval(() => {
        provider.getBlockNumber().then((currentBlockNumber) => {
          setWithdrawAvailable(upkeep.maxValidBlockNumber < currentBlockNumber);
          setCurrentBlockNumber(currentBlockNumber);
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [upkeep]);

  const init = async () => {
    const keeperRegistry = new KeeperRegistry();
    await keeperRegistry.init();
    setKeeperRegistry(keeperRegistry);
  }

  const createUpkeep = async () => {
    setKeeperRegistry(keeperRegistry);
    const upkeep = await keeperRegistry.createUpkeep(inputName, inputTargetContract, inputGasLimit, inputAdminAddress, inputAmount);
    setUpkeep(upkeep);
    getUpkeep();
  };

  const getUpkeep = async () => {
    const upkeep = await keeperRegistry.getUpkeep(inputId);
    setUpkeep(upkeep);
  };

  const getKeeperRegistryConfig = async () => {
    const keeperRegistryConfig = await keeperRegistry.getRegistrationConfig();
    setKeeperRegistryConfig(keeperRegistryConfig);
  };

  const handleFund = async () => {
    const action = await upkeep.fund(inputNewAmount);
    await action.present();
    getUpkeep();
  };

  const handlePauseUpkeep = async () => {
    const action = await upkeep.pauseUpkeep();
    await action.present();
    getUpkeep();
  };

  const handleUnpauseUpkeep = async () => {
    const action = await upkeep.unpauseUpkeep();
    await action.present();
    getUpkeep();
  };

  const handleSetGasLimit = async () => {
    const action = await upkeep.setGasLimit(inputNewGasLimit);
    await action.present();
    getUpkeep();
  };

  const handleSetOffchainConfig = async () => {
    const action = await upkeep.setUpkeepOffchainConfig(inputOffchainConfig);
    await action.present();
    getUpkeep();
  };

  const handleCancel = async () => {
    const action = await upkeep.cancel();
    await action.present();
    getUpkeep();
    setCounterVisible(true);
  };

  const handleRequestUpkeepAdminTransfer = async () => {
    const action = await upkeep.transferUpkeepAdmin(inputAdmin);
    await action.present();
  };

  const handleAcceptUpkeepAdminTransfer = async () => {
    const action = await upkeep.acceptUpkeepAdmin();
    await action.present();
    getUpkeep();
  };

  const handleWithdrawFunds = async () => {
    const action = await upkeep.withdrawFunds(inputWithdrawAddress);
    await action.present();
    getUpkeep();
  };

  return (
    <div className="App">
      <div className='network'>
        <h2>This app is running on the Sepolia test network</h2>
      </div>
      <h1>Keeper Registry Info</h1>
      <div>
        { keeperRegistryConfig && 
          <table>
              <tr>
                <th>Auto-approve registration</th>
                <td>{keeperRegistryConfig.autoApproveConfigType}</td>
              </tr>
              <tr>
                <th>Max number of auto-approve registrations</th>
                <td>{keeperRegistryConfig.autoApproveMaxAllowed}</td>
              </tr>
              <tr>
                <th>Number of auto-approve registrations</th>
                <td>{keeperRegistryConfig.approvedCount}</td>
              </tr>
              <tr>
                <th>Keeper registry address</th>
                <td>{keeperRegistryConfig.keeperRegistry}</td>
              </tr>
              <tr>
                <th>Min LINK for new registration</th>
                <td>{keeperRegistryConfig.minLINKJuels}</td>
              </tr>
          </table>
        }
        <button onClick={getKeeperRegistryConfig}>Get Keeper Registry Config</button>
      </div>
      <h1>Upkeep Info & Management</h1>
      {upkeep && (
        <div>
          <table>
            <tr>
              <th>ID</th>
              <td>{upkeep.id}</td>
            </tr>
            <tr>
              <th>Balance</th>
              <td>{upkeep.balance}</td>
            </tr>
            <tr>
              <th>Minimum Balance</th>
              <td>{upkeep.minBalance}</td>
            </tr>
            <tr>
              <th>Target Contract</th>
              <td>{upkeep.targetContract}</td>
            </tr>
            <tr>
              <th>Admin</th>
              <td>{upkeep.admin}</td>
            </tr>
            <tr>
              <th>Execute Gas</th>
              <td>{upkeep.executeGas}</td>
            </tr>
            <tr>
              <th>Max Valid Block Number</th>
              <td>{upkeep.maxValidBlockNumber}</td>
            </tr>
            <tr>
              <th>Last Perform Block Number</th>
              <td>{upkeep.lastPerformBlockNumber}</td>
            </tr>
            <tr>
              <th>Amount Used</th>
              <td>{upkeep.amountSpent}</td>
            </tr>
            <tr>
              <th>Paused</th>
              <td>{String(upkeep.paused)}</td>
            </tr>
            <tr>
              <th>Check Data</th>
              <td>{upkeep.checkData.length > 0 ? upkeep.checkData : "[ ]"}</td>
            </tr>
            <tr>
              <th>Off Chain Config</th>
              <td>{upkeep.offchainConfig.length > 70 ? String(upkeep.offchainConfig).substring(0, 70) + '...' : upkeep.offchainConfig}</td>
            </tr>
          </table>
        </div>
      )}
      <div className="upkeep">
        <div>
          <input
            type="number"
            placeholder="Upkeep ID"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
          />
          { inputId && <button onClick={getUpkeep}>Get Upkeep</button> }
        </div>
      </div>
      { !inputId && 
        <div className="upkeep">
          <button onClick={createUpkeep} style={{margin: "auto"}}>Create Upkeep</button>
          <div>
            <input
              type="string"
              placeholder="Name"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="string"
              placeholder="Target Contract"
              value={inputTargetContract}
              onChange={e => setInputTargetContract(e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Gas Limit"
              value={inputGasLimit}
              onChange={e => setInputGasLimit(e.target.value)}
            />
          </div>
          <div>
            <input
              type="string"
              placeholder="Admin Address"
              value={inputAdminAddress}
              onChange={e => setInputAdminAddress(e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
            />
          </div>
        </div>
      }
      {upkeep && inputId &&
      <>
        <div className='management'>
          <div>
            <input
              type="number"
              placeholder="Amount"
              value={inputNewAmount}
              onChange={e => setInputNewAmount(e.target.value)}
            />
            <button onClick={handleFund}>Fund</button>
          </div>
          <div>
            <input
              type="number"
              placeholder="Gas Limit"
              value={inputNewGasLimit}
              onChange={e => setInputNewGasLimit(e.target.value)}
            />
            <button onClick={handleSetGasLimit}>Set Gas Limit</button>
          </div>
          <div>
            <input
              type="string"
              placeholder="Offchain Config"
              value={inputOffchainConfig}
              onChange={e => setInputOffchainConfig(e.target.value)}
            />
            <button onClick={handleSetOffchainConfig}>Set Offchain Config</button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Admin Address"
              value={inputAdmin}
              onChange={e => setInputAdmin(e.target.value)}
            />
            <button onClick={handleRequestUpkeepAdminTransfer}>Transfer Upkeep Admin</button>
          </div>
          <div>
            <button onClick={handleAcceptUpkeepAdminTransfer}>Accept Upkeep Admin</button>
          </div>
          <div>
            <button onClick={handlePauseUpkeep}>Pause Upkeep</button>
          </div>
          <div>
            <button onClick={handleUnpauseUpkeep}>Unpause Upkeep</button>
          </div>
          <div>
            <button onClick={handleCancel}>Cancel</button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Address"
              value={inputWithdrawAddress}
              onChange={e => setInputWithdrawAddress(e.target.value)}
              disabled={!withdrawAvailable}
            />
            <button onClick={handleWithdrawFunds} disabled={!withdrawAvailable} >Withdraw Funds</button>
          </div>
          {counterVisible &&
            <div>
              <p>Withdraw available {upkeep.maxValidBlockNumber - currentBlockNumber < 0 ? "" : `in ${upkeep.maxValidBlockNumber - currentBlockNumber} blocks.`}</p>
            </div>
          }
        </div>
      </>
      }
    </div>
  );
}

export default App;