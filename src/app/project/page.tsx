"use client";

import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import doRequest from '@/components/doRequest';
import network from '@/../public/Network.svg'
import nodes from '@/../public/NetworkNodes.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import Button from '@/components/button';

interface ProjectProps {
  params: {
    id?: string;
  };
}

enum LayerTypes {
    dense = "Dense",
    convolution = "Convolution",
    activation = "Activation",
    flatten = "Flatten",
    softmax = "Softmax"
}

const Project: FC<ProjectProps> = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const [projectConfig, setProjectConfig] = useState<{
    "name": string,
    "hidden_layers": {"nodes": number, "type": LayerTypes}[],
    "input"?: "image"|"audio"|"text"|"id"|"script",
    "training_data_path"?: string
  }>({"name": id, "hidden_layers": [{"nodes": 0, "type":LayerTypes.dense}]});

  const handleFunction = (param: string) => {
    doRequest({ url: 'get_project_config', reqmethod: 'POST', data: { data: param } })
    .then((data) => {
      setProjectConfig(data['data']);
      if (!projectConfig.hidden_layers) {
        projectConfig.hidden_layers = [{"nodes": 100, "type":LayerTypes.dense}]
      }
      if (!projectConfig.input) {
        projectConfig.input = "id"
      }
    });
  };

  function insertLayer(key: number, defaultNodes:number = 100) {
    let newConfig = projectConfig;
    newConfig.hidden_layers.splice(key-1, 0, {"nodes": defaultNodes, "type": LayerTypes.dense});
    console.log(newConfig);
    setProjectConfig({...newConfig});
  }

  const LayerTypesList = Object.values(LayerTypes)

  useEffect(() => {
    if (id) {
      handleFunction(id);
    }
  }, [id]);

  return (
    <div className='block w-[100vw] h-[100vh]'>
        <div className='w-full h-fit flex items-center justify-center text-white text-xl font-semibold p-5'>
            {`Setup for ${id}`}
        </div>
        {/* {
            process.env.NODE_ENV === 'development' &&
            <div className='bg-white text-black w-fit h-fit p-2 cursor-pointer' onClick={()=>{setProjectConfig({
                "name": projectConfig['name'],
                "hidden_layers": [{"nodes": 25, "type": LayerTypes.dense}, {"nodes": 35, "type": LayerTypes.dense}, {"nodes": 45, "type": LayerTypes.dense}],
                "input": "id"
            })}}>Use test setup</div>
        } */}
        <div className='flex h-[40vh] mt-20 w-full items-center justify-center'>
            <div className='block h-full'>
                <img src={network.src} className='h-[90%] duration-200'/>
                <div className='h-[full] w-[65px] flex text-white items-center justify-center text-center'>
                    Input
                </div>
            </div>
            {
                projectConfig.hidden_layers?.map((layerData, key)=>{
                    return (
                        <div className='block h-full' key={key}>
                            <img src={network.src} className='h-[90%] duration-200'/>
                            <Popover>
                                <PopoverButton className='h-[full] w-[65px] flex text-white items-center justify-center text-center hover:opacity-50 cursor-pointer outline-none'>
                                    {layerData.nodes}
                                    <FontAwesomeIcon icon={faPlay} className='w-full -ml-5 -mr-6 scale-75 rotate-90'/>
                                </PopoverButton>
                                <PopoverPanel className="absolute z-10">
                                    <div className="px-2 py-1 bg-white border rounded mt-2 shadow block justify-center space-y-0.5">
                                        <div className='flex justify-center w-full font-semibold'>{`Hidden layer ${key+1}`}</div>
                                        <div className='flex justify-center w-full'>{`Number of nodes: `}
                                            <input type='text' maxLength={4} className='rounded border border-gray-400 ml-2 w-[4em] px-1' value={projectConfig.hidden_layers[key].nodes} onChange={(t) => {
                                                const target = t.target as HTMLInputElement;
                                                target.value = target.value.replace(/[^0-9]/g, '');
                                                let newConfig = projectConfig;
                                                newConfig.hidden_layers[key].nodes = parseInt(target.value) ? parseInt(target.value) : 0;
                                                setProjectConfig({...newConfig});
                                            }}/>
                                        </div>
                                        {/* dropdown for type of layer */}
                                        <div className='flex justify-center w-full'>{`Type: `}
                                            <select className='rounded border border-gray-400 ml-2 w-fit min-w-[5em] px-1' value={projectConfig.hidden_layers[key].type} onChange={(t) => {
                                                const target = t.target as HTMLSelectElement;
                                                let newConfig = projectConfig;
                                                newConfig.hidden_layers[key].type = target.value as LayerTypes;
                                                setProjectConfig({...newConfig});
                                            }}>
                                                {
                                                    LayerTypesList.map((layerType)=> {
                                                        return (
                                                            <option value={layerType}>{layerType}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                        <div className='flex justify-center w-full h-fit space-x-1'>
                                            <Button className='px-1' variation={3} onClick={()=>{insertLayer(key, layerData.nodes)}}>Add layer before</Button>
                                            <Button className='px-1' variation={3} onClick={()=>{insertLayer(key+2, layerData.nodes)}}>Add layer after</Button>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </Popover>
                        </div>
                    )
                })
            }
            <div className='block h-full'>
                <img src={nodes.src} className='h-[90%] duration-200'/>
                <div className='h-[full] w-[65px] flex text-white items-center justify-center text-center'>
                    Output
                </div>
            </div>
        </div>
        {/* Save button */}
        <Button className='m-4 px-6 py-4 w-fit h-fit bg-gray-700 text-white font-semibold' onClick={()=>{
            doRequest({ url: 'set_project_config', reqmethod: 'POST', data: { data: projectConfig } })
            .then((data) => {
                if (data['data'] === "completed") {
                    window.location.href = "/"
                }
            });
        }}>
            <>Save</>
        </Button>
    </div>
  );
};

export default Project;
