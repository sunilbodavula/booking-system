import * as resourceRepo from '../repository/resource.repository';
import { ResourceInput, Resource } from '../types';
import { HttpError } from '../utils/HttpError';

const validate = (input: Partial<ResourceInput>): void => {
    if(typeof input.name !== 'string' || input.name.trim() === ''){
        throw new HttpError(400, 'Name is required and must be a non-empty string');
    }
    if(input.capacity !== undefined && (!Number.isInteger(input.capacity) || input.capacity < 1)){
        throw new HttpError(400, 'Capacity must be a positive integer');
    }
};

export const getAllResource = async (): Promise<Resource[]> => resourceRepo.findAllResources();

export const getResourceById = async (id: number): Promise<Resource> => {
    const resource = await resourceRepo.findResourceById(id);
    if(!resource){
        throw new HttpError(404, 'Resource not found');
    }
    return resource;
}

export const createResource = async (input: ResourceInput): Promise<Resource> => {
    validate(input);
    return resourceRepo.createResource(input);
}

export const updateResource = async (id: number, input: ResourceInput): Promise<Resource> => {
    validate(input);
    const updated = await resourceRepo.updateResouce(id, input);
    if(!updated){
        throw new HttpError(404, 'Resource ${id} not found');
    }
    return updated;
};

export const deleteResource = async (id: number) : Promise<void> => {
    const deleted = await resourceRepo.deleteResource(id);
    if(!deleted){
        throw new HttpError(404, 'Resource ${id} not found');
    }
}