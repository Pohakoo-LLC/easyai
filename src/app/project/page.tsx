"use client";

import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import doRequest from '@/components/doRequest';
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
import LayerCustomizer, { listToString } from '@/components/layerCustomizer';
import NetImg from '@/components/networkImg';

interface ProjectProps {
  params: {
    id?: string;
  };
}

export enum LayerTypes {
    dense = "Dense",
    conv = "Convolution",
    pooling = "Max pooling",
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

export type projConfigType = {
    "name": string,
    "hidden_layers": {"size": number[], "type": LayerTypes, "config"?: {"filters"?: number, "activation"?: "sig"|"ReLU"|"linear"|"Softmax", "transpose"?: boolean}}[],
    "input"?: {
        "type":InputTypes,
        "size"?: number
    },
    "output"?: {
        "type":OutputTypes,
        "size"?: number
    },
    "training_data_path"?: string
  }

const Project: FC<ProjectProps> = () => {
  const [searchParams, setSearchParams] = useState<URLSearchParams|undefined>(undefined);
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
    if (process.env.NODE_ENV !== 'development') {
        window.addEventListener('beforeunload', function (e) {
            // Prevent the default action (page close)
            e.preventDefault();
            // Custom message (browsers often ignore it and show their own message)
            e.returnValue = 'Are you sure you want to exit? You will lose unsaved changes.';
        });
    }
  }, []);
  const id = searchParams?.get('id') || '';
  const [projectConfig, setProjectConfig] = useState<projConfigType>({"name": id, "hidden_layers": [{"size": [100], "type":LayerTypes.dense}]});

  const handleFunction = (param: string) => {
    doRequest({ url: 'get_project_config', reqmethod: 'POST', data: { data: param } })
    .then((data) => {
      setProjectConfig(data['data']);
      if (!projectConfig.hidden_layers) {
        projectConfig.hidden_layers = [{"size": [100], "type":LayerTypes.dense}]
      }
      if (!projectConfig.input) {
        projectConfig.input = {"type":InputTypes.id}
      }
    });
  };

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
                                <>
                                    <option value={undefined}>Select</option>
                                    {
                                        Object.values(InputTypes).map((inputType, id)=> {
                                            return (
                                                <option value={inputType} key={id}>{inputType}</option>
                                            )
                                        })
                                    }
                                </>
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
                    <NetImg className='h-[90%] duration-200'/>
                    <div className='h-[full] w-[65px] flex items-center justify-center text-center'>
                        Input
                    </div>
                </div>
                {
                    projectConfig.hidden_layers?.map((layerData, key)=>{
                        const type = layerData.type
                        return (
                            <div className='block h-full' key={key}>
                                <NetImg className='h-[90%] duration-200' color={type === LayerTypes.conv ? 'yellow' : type === LayerTypes.pooling ? 'green' : 'white'}/>
                                <Popover>
                                    <PopoverButton className='h-[full] w-[65px] flex items-center justify-center text-center hover:opacity-50 cursor-pointer outline-none'>
                                        <FontAwesomeIcon icon={faPlay} className='w-3 mr-1 scale-75 rotate-90'/>
                                        <div>{listToString(layerData.size)}</div>
                                    </PopoverButton>
                                    <PopoverPanel className="absolute z-10 text-black w-fit">
                                        <LayerCustomizer projectConfig={projectConfig} setProjectConfig={setProjectConfig} layerData={layerData} id={key} />
                                    </PopoverPanel>
                                </Popover>
                            </div>
                        )
                    })
                }
                <div className='block h-full'>
                    {/* <img src={nodes.src} className='h-[90%] duration-200'/> */}
                    <NetImg className='h-[90%] duration-200' version='nodes'/>
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
                                {
                                    Object.values(OutputTypes).map((outputType, id)=> {
                                        return (
                                            <option value={outputType} key={id}>{outputType}</option>
                                        )
                                    })
                                }
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
