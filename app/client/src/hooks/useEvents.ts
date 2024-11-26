import { useEffect, useState } from "react";
import { num, hash, RpcProvider, events as starknetEvents, CallData } from "starknet";
import { ABI as LandRegistryABI } from "@/abis/LandRegistryAbi";

import type { UseEventsParams, Event } from "@/types/interfaces"; 

const contracts = {
  landRegister: { address:"0x5a4054a1b1389dcd48b650637977280d32f1ad8b3027bc6c7eb606bf7e28bf5", abi: LandRegistryABI }
}


export function useEvents({ name, triggerRefetch, filters }: UseEventsParams) { 

    const [events, setEvents] = useState<Event[]>([])
    
    useEffect(()=>{
        (async()=>{
          try {
            const provider = new RpcProvider({ });
            // num.toHex(hash.starknetKeccak('LandRegistered')), 
            const eventFilters = filters?.events.map(event => num.toHex(hash.starknetKeccak(event))) || []

            const keyFilter = [
              [
                ...eventFilters
              ],
            ];

            
    
            const eventsRes = await provider.getEvents({
              address: "0x5a4054a1b1389dcd48b650637977280d32f1ad8b3027bc6c7eb606bf7e28bf5",
              keys: keyFilter,
              chunk_size: 30,
            });
    
            // parsing event
            const abiEvents = starknetEvents.getAbiEvents(contracts[name].abi);
            const abiStructs = CallData.getAbiStruct(contracts[name].abi);
            const abiEnums = CallData.getAbiEnum(contracts[name].abi);
            const parsed = starknetEvents.parseEvents(eventsRes.events, abiEvents, abiStructs, abiEnums);
            
            const formattedEvents:Event[] = []
    
            for (let i:number = 0; i <eventsRes.events.length; i++) {
              const rawEvent = eventsRes.events[i]
              const parsedEvent = parsed[i]
    
              const fullKeys = Object.keys(parsedEvent)[0].split("::");
              const eventName = fullKeys[fullKeys.length - 1]
    
              formattedEvents.push({
                eventKey:Object.keys(parsedEvent)[0],
                eventName,
                rawEvent, 
                parsedEvent
              })
            }
    
            setEvents(formattedEvents)
    
          } catch (error) {
            console.log(error)
          }
        })()
      }, [triggerRefetch])
      
  return {
    events,    
  }
}