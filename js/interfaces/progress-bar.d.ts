export interface ProgressBar {
    showProgressForTask(id: string, status: string, current: number, total: number): any;
}