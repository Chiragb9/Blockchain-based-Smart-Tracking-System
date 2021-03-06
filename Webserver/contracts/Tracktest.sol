// SPDX-License-Identifier: ChiragBhardwaj

pragma solidity >=0.4.22 <0.9.0;

contract Tracktest{
    
    struct Data{
        string timestamp;
        string location;
        string temperature;
        string shock;
    }
    
    mapping(string => Data) public deviceData;
    mapping(string => string) public deviceHashedData;
    
    function putHashedData(string memory key, string memory HashedData) public{
        deviceHashedData[key]=HashedData;
    }
    
    function getHashedData(string memory key) public view returns (string memory){
        return deviceHashedData[key];
    }
    
    function putData(string memory key, string memory time, string memory loc, string memory temp, string memory shck) public{
        deviceData[key]=Data(time, loc, temp, shck);
    }
}