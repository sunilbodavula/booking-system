import * as resourceRepo from '../repository/resource.repository';
import { ResourceInput, Resource } from '../types';
import { HttpError } from '../utils/HttpError';

export const getAllResource = async (): Promise<Resource[]> => resourceRepo.findAllResources();

export const getResourceById = async (id: number): Promise<Resource> => {
    const resource = await resourceRepo.findResourceById(id);
    if(!resource){
        throw new HttpError(404, 'Resource not found');
    }
    return resource;
}

export const createResource = async (input: ResourceInput): Promise<Resource> => {
    return resourceRepo.createResource(input);
}

export const updateResource = async (id: number, input: ResourceInput): Promise<Resource> => {
    const updated = await resourceRepo.updateResouce(id, input);
    if(!updated){
        throw new HttpError(404, `Resource ${id} not found`);
    }
    return updated;
};

export const deleteResource = async (id: number) : Promise<void> => {
    const deleted = await resourceRepo.deleteResource(id);
    if(!deleted){
        throw new HttpError(404, `Resource ${id} not found`);
    }
}