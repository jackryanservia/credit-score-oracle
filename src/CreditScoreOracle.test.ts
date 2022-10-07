import { CreditScoreOracle } from './CreditScoreOracle';
import {
  Mina,
  PrivateKey,
  AccountUpdate,
  PublicKey,
  isReady,
  shutdown,
  Field,
  Signature,
} from 'snarkyjs';

const ORACLE_PUBLIC_KEY =
  'B62qp24xA8az6sZbCFLaswALCKZLYWSErw4rAbej3b4aoLqumamcSAu';

function createLocalBlockchain() {
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  return Local.testAccounts[0].privateKey;
}

async function localDeploy(
  zkAppInstance: CreditScoreOracle,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivatekey });
    zkAppInstance.init();
    zkAppInstance.sign(zkAppPrivatekey);
  });
  await txn.send().wait();
}

describe('CreditScoreOracle.js', () => {
  describe('CreditScoreOracle', () => {
    let deployerAccount: PrivateKey,
      zkAppAddress: PublicKey,
      zkAppPrivateKey: PrivateKey;

    beforeEach(async () => {
      await isReady;
      deployerAccount = createLocalBlockchain();
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
    });

    afterAll(async () => {
      // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
      // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
      // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
      setTimeout(shutdown, 0);
    });

    it('generates and deploys the smart contract', async () => {
      const zkAppInstance = new CreditScoreOracle(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
      const expectedOraclePublicKey = PublicKey.fromBase58(ORACLE_PUBLIC_KEY);
      const oraclePublicKey = zkAppInstance.oraclePublicKey.get();
      expect(oraclePublicKey).toEqual(expectedOraclePublicKey);
    });

    it('emits an `id` event with the user id if their credit score is above 700', async () => {
      const zkAppInstance = new CreditScoreOracle(zkAppAddress);
      await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
      const txn = await Mina.transaction(deployerAccount, () => {
        const id = Field(1);
        const creditScore = Field(787);
        const signature = Signature.fromJSON({
          r: '17859574271620321107590356127964854787149517218498079908573145619732677942319',
          s: '9100051314338968251637190187736323768062018966372903547179586642740748118059',
        });
        zkAppInstance.verify(
          id,
          creditScore,
          signature ?? fail('something is wrong with the signature')
        );
        zkAppInstance.sign(zkAppPrivateKey);
      });
      await txn.send().wait();

      const events = await zkAppInstance.fetchEvents();
      console.log(events[0].event);
    });
  });
});
