import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
} from 'snarkyjs';

const ORACLE_PUBLIC_KEY =
  'B62qp24xA8az6sZbCFLaswALCKZLYWSErw4rAbej3b4aoLqumamcSAu';

export class CreditScoreOracle extends SmartContract {
  // State
  @state(PublicKey) oraclePublicKey = State<PublicKey>();

  // Events
  events = {
    id: Field,
  };

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    // Initialize contract state
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
  }

  @method verify(id: Field, creditScore: Field, signature: Signature) {
    // Get on-chain variables
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);

    // Verify signature
    const validSignature = signature.verify(oraclePublicKey, [id, creditScore]);

    // Check that signature is valid
    validSignature.assertTrue();

    // Check that credit score is above 700
    // `creditScore.assertGte(700) will also work, SnarkyJS will convert 700
    // the JavaScript number into a Field :)
    creditScore.assertGte(Field(700));

    // Emit an event indicating that the user id has a sufficiently high
    // credit score
    this.emitEvent('id', id);
  }
}
