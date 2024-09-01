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
import audioImg from '@/../public/Audio.png'
import bwImg from '@/../public/BWImage.png'
import colorImg from '@/../public/ColImage.png'
import identification from '@/../public/Identification.png'
import script from '@/../public/Script.png'
import text from '@/../public/TextToHDVector.png'

interface ProjectProps {
  params: {
    id?: string;
  };
}

enum LayerTypes {
    dense = "Dense",
    conv = "Convolution",
    pooling = "Max pooling",
    unsampling = "Unsampling",
}

enum InputTypes {
    colorImage = "Color Image",
    bwImage = "Black and White Image",
    audio = "Audio",
    text = "Text",
    id = "Identification",
    output_based = "Function of the output",
    other = "Other"
}

enum OutputTypes {
    colorImage = "Color Image",
    bwImage = "Black and White Image",
    audio = "Audio",
    token = "Token",
    id = "Identification",
    other = "Other"
}

const Project: FC<ProjectProps> = () => {
  const [searchParams, setSearchParams] = useState<URLSearchParams|undefined>(undefined);
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);
  const id = searchParams?.get('id') || '';
  const [projectConfig, setProjectConfig] = useState<{
    "name": string,
    "hidden_layers": {"nodes": number, "type": LayerTypes, "config"?: {"filters"?: number, "size"?: number[], "activation"?: "sig"|"ReLU"|"linear"|"Softmax", "transpose"?: boolean, "dimensions"?: number}}[],
    "input"?: {
        "type":InputTypes,
        "size"?: number
    },
    "output"?: {
        "type":OutputTypes,
        "size"?: number
    },
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
        projectConfig.input = {"type":InputTypes.id}
      }
    });
  };

  function insertLayer(key: number, defaultNodes:number = 100) {
    let newConfig = projectConfig;
    newConfig.hidden_layers.splice(key, 0, {"nodes": defaultNodes, "type": LayerTypes.dense});
    setProjectConfig({...newConfig});
  }
  function deleteLayer(key: number) {
    let newConfig = projectConfig;
    if (newConfig.hidden_layers.length > 1) {
        newConfig.hidden_layers.splice(key, 1);
        setProjectConfig({...newConfig});
    }
  }

  const LayerTypesList = Object.values(LayerTypes)

  useEffect(() => {
    if (id) {
      handleFunction(id);
    }
  }, [id]);

  return (
    <div className='block w-[100vw] h-[100vh] text-white'>
        <div className='w-full h-fit flex items-center justify-center text-xl font-semibold p-5'>
            {`Setup for ${id}`}
        </div>
        <div className='flex mt-20 w-full justify-center items-center'>
            <div className='mr-12 block '>
                <Popover>
                    <PopoverButton className="w-full justify-center flex">
                        <Button className='w-full flex justify-center px-2 py-1'>Input configuration</Button>
                    </PopoverButton>
                    <PopoverPanel className="absolute z-10 text-black bg-white rounded p-1 space-y-1 translate-y-[-150%] shadow">
                        <div className="flex justify-center w-full font-semibold">{`Input configuration`}</div>
                        <div className='flex justify-center w-full'>{`Type: `}
                            <select className='rounded border border-gray-400 ml-2 w-fit min-w-[5em] px-1' value={projectConfig.input?.type} onChange={(t) => {
                                const target = t.target as HTMLSelectElement;
                                let newConfig = projectConfig;
                                newConfig.input = {"type": target.value as InputTypes};
                                setProjectConfig({...newConfig});
                            }}>
                                <option value={undefined}>Select</option>
                                <option value="colorImage">Color Image</option>
                                <option value="bwImage">Black and White Image</option>
                                <option value="audio">Audio</option>
                                <option value="text">Text</option>
                                <option value="id">Identification</option>
                                <option value="output_based">Function of the output</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className='flex justify-center w-full'>{`Training data path: `}
                            <input type='text' className='rounded border border-gray-400 ml-2 w-[15em] px-1' value={projectConfig.training_data_path} onChange={(t) => {
                                const target = t.target as HTMLInputElement;
                                let newConfig = projectConfig;
                                newConfig.training_data_path = target.value;
                                setProjectConfig({...newConfig});
                            }}/>
                        </div>
                    </PopoverPanel>
                </Popover>
                <img src={
                    projectConfig.input?.type == InputTypes.audio ? audioImg.src :
                    projectConfig.input?.type == InputTypes.colorImage ? colorImg.src :
                    projectConfig.input?.type == InputTypes.bwImage ? bwImg.src :
                    projectConfig.input?.type == InputTypes.text ? text.src :
                    projectConfig.input?.type == InputTypes.id ? identification.src :
                    projectConfig.input?.type == InputTypes.output_based ? script.src :
                    projectConfig.input?.type == InputTypes.other ? script.src : undefined
                } className='max-w-48 duration-200' onClick={()=>{}}/>
            </div>
            <div className='flex h-[50vh] w-fit items-center'>
                <div className='block h-full'>
                    <img src={network.src} className='h-[90%] duration-200'/>
                    <div className='h-[full] w-[65px] flex items-center justify-center text-center'>
                        Input
                    </div>
                </div>
                {
                    projectConfig.hidden_layers?.map((layerData, key)=>{
                        return (
                            <div className='block h-full' key={key}>
                                <img src={network.src} className='h-[90%] duration-200'/>
                                <Popover>
                                    <PopoverButton className='h-[full] w-[65px] flex items-center justify-center text-center hover:opacity-50 cursor-pointer outline-none'>
                                        {layerData.nodes}
                                        <FontAwesomeIcon icon={faPlay} className='w-full -ml-5 -mr-6 scale-75 rotate-90'/>
                                    </PopoverButton>
                                    <PopoverPanel className="absolute z-10 text-black">
                                        <div className="px-2 py-1 bg-white border rounded mt-2 shadow block justify-center space-y-0.5">
                                            <div className='flex justify-center w-full font-semibold mb-2'>{`Hidden layer ${key+1}`}</div>
                                            <div className='flex justify-center w-full'>{`Number of nodes: `}
                                                <input type='text' maxLength={6} className='rounded border border-gray-400 ml-2 w-[4em] px-1' value={projectConfig.hidden_layers[key].nodes} onChange={(t) => {
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
                                                        LayerTypesList.map((layerType, key)=> {
                                                            return (
                                                                <option value={layerType} key={key}>{layerType}</option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </div>
                                            <div className='flex justify-center max-w-full space-x-2'>
                                                <>
                                                    {
                                                        projectConfig.hidden_layers[key].type == LayerTypes.conv &&
                                                        <div className='flex justify-center w-full'>{`Filters: `}
                                                            <input type='text' maxLength={6} className='rounded border border-gray-400 ml-1 w-[4em] px-1' value={projectConfig.hidden_layers[key].config?.filters} onChange={(t) => {
                                                                const target = t.target as HTMLInputElement;
                                                                target.value = target.value.replace(/[^0-9]/g, '');
                                                                let newConfig = projectConfig;
                                                                if (!newConfig.hidden_layers[key].config) {
                                                                    newConfig.hidden_layers[key].config = {};
                                                                }
                                                                newConfig.hidden_layers[key].config.filters = parseInt(target.value) ? parseInt(target.value) : 0;
                                                                setProjectConfig({...newConfig});
                                                            }}/>
                                                        </div>
                                                    }
                                                    {
                                                        projectConfig.hidden_layers[key].type == LayerTypes.conv || projectConfig.hidden_layers[key].type == LayerTypes.pooling || projectConfig.hidden_layers[key].type == LayerTypes.unsampling &&
                                                        <div className='flex justify-center w-full'>{`Size: `}
                                                            <input type='text' maxLength={6} className='rounded border border-gray-400 ml-1 w-[4em] px-1' value={projectConfig.hidden_layers[key].config?.size?.join(",")} onChange={(t) => {
                                                                const target = t.target as HTMLInputElement;
                                                                let newConfig = projectConfig;
                                                                if (!newConfig.hidden_layers[key].config) {
                                                                    newConfig.hidden_layers[key].config = {};
                                                                }
                                                                newConfig.hidden_layers[key].config.size = target.value.split(",").map((val) => {
                                                                    return parseInt(val) ? parseInt(val) : 0;
                                                                });
                                                                setProjectConfig({...newConfig});
                                                            }}/>
                                                        </div>
                                                    }
                                                    {
                                                        projectConfig.hidden_layers[key].type == LayerTypes.conv &&
                                                        <div className='flex justify-center w-full'>{`Activation: `}
                                                            <select className='rounded border border-gray-400 ml-1 w-fit min-w-[5em] px-1' value={projectConfig.hidden_layers[key].config?.activation} onChange={(t) => {
                                                                const target = t.target as HTMLSelectElement;
                                                                let newConfig = projectConfig;
                                                                if (!newConfig.hidden_layers[key].config) {
                                                                    newConfig.hidden_layers[key].config = {};
                                                                }
                                                                newConfig.hidden_layers[key].config.activation = target.value as "sig"|"ReLU"|"linear"|"Softmax";
                                                                setProjectConfig({...newConfig});
                                                            }}>
                                                                <option value={undefined}>Select</option>
                                                                <option value="sig">Sigmoid</option>
                                                                <option value="ReLU">ReLU</option>
                                                                <option value="linear">Linear</option>
                                                                <option value="Softmax">Softmax</option>
                                                            </select>
                                                        </div>
                                                    }
                                                    {
                                                        projectConfig.hidden_layers[key].type == LayerTypes.conv &&
                                                        <div className='flex justify-center w-full'>{`Dimensions: `}
                                                            <input type='text' maxLength={6} className='rounded border border-gray-400 ml-1 w-[4em] px-1' value={projectConfig.hidden_layers[key].config?.dimensions} onChange={(t) => {
                                                                const target = t.target as HTMLInputElement;
                                                                target.value = target.value.replace(/[^0-9]/g, '');
                                                                let newConfig = projectConfig;
                                                                if (!newConfig.hidden_layers[key].config) {
                                                                    newConfig.hidden_layers[key].config = {};
                                                                }
                                                                newConfig.hidden_layers[key].config.dimensions = parseInt(target.value) ? parseInt(target.value) : 0;
                                                                setProjectConfig({...newConfig});
                                                            }}/>
                                                        </div>
                                                    }
                                                    {
                                                        projectConfig.hidden_layers[key].type == LayerTypes.conv &&
                                                        <div className='flex justify-center w-full'>{`Transpose: `}
                                                            <input type='checkbox' className='rounded border border-gray-400 w-5 ml-1 px-1' checked={projectConfig.hidden_layers[key].config?.transpose} onChange={(t) => {
                                                                const target = t.target as HTMLInputElement;
                                                                let newConfig = projectConfig;
                                                                if (!newConfig.hidden_layers[key].config) {
                                                                    newConfig.hidden_layers[key].config = {};
                                                                }
                                                                newConfig.hidden_layers[key].config.transpose = target.checked;
                                                                setProjectConfig({...newConfig});
                                                            }}/>
                                                        </div>
                                                    }
                                                </>
                                            </div>
                                            <div className='flex justify-center w-full h-fit space-x-1'>
                                                <Button className='px-1' variation={3} onClick={()=>{insertLayer(key-1, layerData.nodes)}}>Add layer before</Button>
                                                <Button className='px-1' variation={3} onClick={()=>{insertLayer(key+1, layerData.nodes)}}>Add layer after</Button>
                                            </div>
                                            <div className='flex justify-center w-full h-fit space-x-1 pt-1'>
                                                <Button className='px-1' variation={3} onClick={()=>{deleteLayer(key)}} enabled={projectConfig.hidden_layers.length > 1}>Remove</Button>
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
                    <div className='h-[full] w-[65px] flex items-center justify-center text-center'>
                        Output
                    </div>
                </div>
            </div>
            <div className='ml-12 block'>
                <Popover>
                    <PopoverButton className="w-full justify-center flex">
                        <Button className='w-full flex justify-center px-2 py-1'>Output configuration</Button>
                    </PopoverButton>
                    <PopoverPanel className="absolute z-10 text-black bg-white rounded p-1 space-y-1 translate-y-[-180%] shadow">
                        <div className="flex justify-center w-full font-semibold">{`Output configuration`}</div>
                        <div className='flex justify-center w-full'>{`Type: `}
                            <select className='rounded border border-gray-400 ml-2 w-fit min-w-[5em] px-1' value={projectConfig.output?.type} onChange={(t) => {
                                const target = t.target as HTMLSelectElement;
                                let newConfig = projectConfig;
                                newConfig.output = {"type": target.value as OutputTypes};
                                setProjectConfig({...newConfig});
                            }}>
                                <option value={undefined}>Select</option>
                                <option value="colorImage">Color Image</option>
                                <option value="bwImage">Black and White Image</option>
                                <option value="audio">Audio</option>
                                <option value="text">Text</option>
                                <option value="id">Identification</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </PopoverPanel>
                </Popover>
                <img src={
                    projectConfig.output?.type == OutputTypes.audio ? audioImg.src :
                    projectConfig.output?.type == OutputTypes.colorImage ? colorImg.src :
                    projectConfig.output?.type == OutputTypes.bwImage ? bwImg.src :
                    projectConfig.output?.type == OutputTypes.token ? text.src :
                    projectConfig.output?.type == OutputTypes.id ? identification.src :
                    projectConfig.output?.type == OutputTypes.other ? script.src : undefined
                } className='max-w-48 duration-200' onClick={()=>{}}/>
            </div>
        </div>
        <Button className='m-4 px-6 py-4 w-fit h-fit bg-gray-700 font-semibold' onClick={()=>{
            doRequest({ url: 'set_project_config', reqmethod: 'POST', data: { data: projectConfig } })
            .then((data) => {
                if (data['data'] === "completed") {
                    window.location.href = "/"
                }
            });
        }}>
            <>Save and Exit</>
        </Button>
    </div>
  );
};

export default Project;
