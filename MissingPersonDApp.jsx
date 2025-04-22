import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
const contractABI = [
  "function reportMissingPerson(string memory _name, uint _age, string memory _location) public",
  "function markPersonFound(uint index) public",
  "function getMissingPerson(uint index) public view returns (string memory, uint, string memory, bool)",
  "function getTotalMissingPersons() public view returns (uint)",
];

export default function MissingPersonDApp() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  const connectWallet = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    setSigner(signer);
    setContract(contractInstance);
    fetchPersons(contractInstance);
  };

  const fetchPersons = async (contractInstance) => {
    const total = await contractInstance.getTotalMissingPersons();
    const list = [];
    for (let i = 0; i < total; i++) {
      const data = await contractInstance.getMissingPerson(i);
      list.push({
        index: i,
        name: data[0],
        age: data[1],
        location: data[2],
        found: data[3],
      });
    }
    setPersons(list);
  };

  const reportPerson = async () => {
    await contract.reportMissingPerson(name, parseInt(age), location);
    setName("");
    setAge("");
    setLocation("");
    fetchPersons(contract);
  };

  const markFound = async (index) => {
    await contract.markPersonFound(index);
    fetchPersons(contract);
  };

  return (
    <div className="p-4 space-y-6">
      <Button onClick={connectWallet}>Connect Wallet</Button>

      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-bold">Report Missing Person</h2>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button onClick={reportPerson}>Submit</Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Reported Persons</h2>
      {persons.map((p, idx) => (
        <Card key={idx} className="mb-2">
          <CardContent className="p-4">
            <p>
              <strong>Name:</strong> {p.name}
            </p>
            <p>
              <strong>Age:</strong> {p.age}
            </p>
            <p>
              <strong>Location:</strong> {p.location}
            </p>
            <p>
              <strong>Status:</strong> {p.found ? "Found" : "Missing"}
            </p>
            {!p.found && (
              <Button onClick={() => markFound(p.index)}>Mark as Found</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
