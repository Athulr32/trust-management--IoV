
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract WSN{


    mapping(address=>string) authVeh;
    address[] vehList;
    mapping(address=>int)trustValue;
    mapping(address=>uint)check;

    function authVehicle(address addr,string memory loc) public  {
  
        authVeh[addr]=loc; //Assign the location

        

        if(check[addr]!=1){
              check[addr] = 1;
              vehList.push(addr); //List of authorised vehicles
        }

        if(trustValue[addr]==0){

            trustValue[addr]=50;
        }
      

    }

    function getAuthvehicle()public view returns (address[] memory){

        return vehList;

    }


    function removeVehicle(address addr) public{

        delete authVeh[addr];
        check[addr]=0;

    }

    function updateTrustValue(address addr,int value) public {

        trustValue[addr]=trustValue[addr]+value;


    }

    function getTrustValueAndLocation(address addr)public view returns(int,string memory){


        return (trustValue[addr],authVeh[addr]);

    }


    function verifyVehicle(address addr) public view returns (bool){

        //IF the key is in check, then this vehicle is registered
        if(check[addr]==1){
            return true;
        }
        else{
            return false;
        }

    }





}