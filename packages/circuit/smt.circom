pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";

component main {public [root,key,value,fnc]} = SMTVerifier(10);
