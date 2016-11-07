import { ProgressBar } from "../interfaces/progress-bar";
export declare class ProgressBarImpl implements ProgressBar {
    private config;
    private progressBarMap;
    private offset;
    showProgressForTask(id: string, status: string, current: number, total: number): void;
}
