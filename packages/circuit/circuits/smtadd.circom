pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/smt/smtprocessor.circom";

template add(nLevels)
{    
	signal input oldRoot;
    signal output newRoot;
    signal input siblings[nLevels];
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input newKey; // max newKey is 21888242871839275222246405745257275088548364400416034343698204186575808495617
    signal input newValue;
	
	// newValue should not be 0 or 1
	component compare = GreaterEqThan(16);
	compare.in[0] <== newValue;
	compare.in[1] <== 2;
 	compare.out === 1; 
 
	component smt = SMTProcessor(nLevels);
	smt.oldRoot 	<== oldRoot;
	for(var i = 0; i < nLevels; i++) smt.siblings[i] <== siblings[i];
	smt.oldKey		<== oldKey;
	smt.oldValue	<== oldValue;
	smt.isOld0		<== isOld0;
	smt.newKey		<== newKey;
	smt.newValue	<== newValue;
	smt.fnc[0]		<== 1;
	smt.fnc[1]		<== 0;
	smt.newRoot		==> newRoot;
}

component main {public [oldRoot,newKey,newValue]} = add(16);