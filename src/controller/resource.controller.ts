import { Request, Response, NextFunction } from 'express';
import * as resourceService from '../services/resource.service';
import { parseId } from '../utils/parseId';
import { ResourceListQuery } from '../types';

export const getAllResources = async (_req: Request, res: Response): Promise<void> => {
    res.json(await resourceService.listResource(res.locals.query as ResourceListQuery))
}

export const getResourceById = async (req: Request, res: Response): Promise<void> => {
    const resourceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    res.json(await resourceService.getResourceById(parseId(resourceId)));
}

export const createResource = async (req: Request, res: Response): Promise<void> => {
    const created = await resourceService.createResource(req.body ?? {});
    res.status(201).json(created);
}

export const updateResource = async (req: Request, res: Response): Promise<void> => {
    const resourceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await resourceService.updateResource(parseId(resourceId), req.body ?? {});
    res.json(updated);
}

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
    const resourceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await resourceService.deleteResource(parseId(resourceId));
    res.status(204).send();
}