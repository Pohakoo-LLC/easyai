"use client";

import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import doRequest from '@/components/doRequest';

interface ProjectProps {
  params: {
    id?: string;
  };
}

const Project: FC<ProjectProps> = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const [projectConfig, setProjectConfig] = useState<any>({});

  const handleFunction = (param: string) => {
    doRequest({ url: 'get_project_config', reqmethod: 'POST', data: { data: param } })
    .then((data) => {
      setProjectConfig(data['data']);
    });
  };

  useEffect(() => {
    if (id) {
      handleFunction(id);
    }
  }, [id]);

  return (
    <div>
      <h1>Item Page</h1>
      <p>Item ID: {id}</p>
    </div>
  );
};

export default Project;
