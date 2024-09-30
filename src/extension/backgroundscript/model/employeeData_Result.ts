import { constStrings } from '../utils/constants';
import Metadata from './metadata';

export default class TimeData_Result {
    public constructor(
        public metadata: Metadata,
        public applicationId: string,
        public employeePicMaxFilesize: string,
        public employeeId: string,
        public employmentStatus: string,
        public employmentStatusText: string,
        public assignmentText: string,
        public isDefaultAssignment: boolean,
        public defaultVersionId: string,
        public isCeButtonEnabled: boolean,
        public isOnBehalfEnabled: boolean,
        public isChangePictureEnabled: boolean,
        public isManager: boolean,
        public showEmployeePicture: boolean,
        public showEmployeeNumber: boolean,
        public showEmployeeNumberWithoutZeros: boolean,
        public useOnbehalfBackendSearch: boolean,
    ) {}

    public static fromObject(obj: object): TimeData_Result {
        if (
            !('__metadata' in obj) ||
            !obj.__metadata ||
            !('ApplicationId' in obj) ||
            typeof obj.ApplicationId !== 'string' ||
            !('EmployeePicMaxFilesize' in obj) ||
            typeof obj.EmployeePicMaxFilesize !== 'string' ||
            !('EmployeeId' in obj) ||
            typeof obj.EmployeeId !== 'string' ||
            !('EmploymentStatus' in obj) ||
            typeof obj.EmploymentStatus !== 'string' ||
            !('EmploymentStatusText' in obj) ||
            typeof obj.EmploymentStatusText !== 'string' ||
            !('AssignmentText' in obj) ||
            typeof obj.AssignmentText !== 'string' ||
            !('IsDefaultAssignment' in obj) ||
            typeof obj.IsDefaultAssignment !== 'boolean' ||
            !('DefaultVersionId' in obj) ||
            typeof obj.DefaultVersionId !== 'string' ||
            !('IsCeButtonEnabled' in obj) ||
            typeof obj.IsCeButtonEnabled !== 'boolean' ||
            !('IsOnBehalfEnabled' in obj) ||
            typeof obj.IsOnBehalfEnabled !== 'boolean' ||
            !('IsChangePictureEnabled' in obj) ||
            typeof obj.IsChangePictureEnabled !== 'boolean' ||
            !('IsManager' in obj) ||
            typeof obj.IsManager !== 'boolean' ||
            !('ShowEmployeePicture' in obj) ||
            typeof obj.ShowEmployeePicture !== 'boolean' ||
            !('ShowEmployeeNumber' in obj) ||
            typeof obj.ShowEmployeeNumber !== 'boolean' ||
            !('ShowEmployeeNumberWithoutZeros' in obj) ||
            typeof obj.ShowEmployeeNumberWithoutZeros !== 'boolean' ||
            !('UseOnbehalfBackendSearch' in obj) ||
            typeof obj.UseOnbehalfBackendSearch !== 'boolean'
        ) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }

        return new TimeData_Result(
            Metadata.fromObject(obj.__metadata),
            obj.ApplicationId,
            obj.EmployeePicMaxFilesize,
            obj.EmployeeId,
            obj.EmploymentStatus,
            obj.EmploymentStatusText,
            obj.AssignmentText,
            obj.IsDefaultAssignment,
            obj.DefaultVersionId,
            obj.IsCeButtonEnabled,
            obj.IsOnBehalfEnabled,
            obj.IsChangePictureEnabled,
            obj.IsManager,
            obj.ShowEmployeePicture,
            obj.ShowEmployeeNumber,
            obj.ShowEmployeeNumberWithoutZeros,
            obj.UseOnbehalfBackendSearch,
        );
    }

    public toObject() {
        return {
            __metadata: this.metadata.toObject(),
            ApplicationId: this.applicationId,
            EmployeePicMaxFilesize: this.employeePicMaxFilesize,
            EmployeeId: this.employeeId,
            EmploymentStatus: this.employmentStatus,
            EmploymentStatusText: this.employmentStatusText,
            AssignmentText: this.assignmentText,
            IsDefaultVersionId: this.isChangePictureEnabled,
            DefaultVersionId: this.defaultVersionId,
            IsCeButtonEnabled: this.isCeButtonEnabled,
            IsOnBehalfEnabled: this.isOnBehalfEnabled,
            IsManager: this.isManager,
            ShowEmployeePicture: this.showEmployeePicture,
            ShowEmployeeNumber: this.showEmployeeNumber,
            ShowEmployeeNumberWithoutZeros: this.showEmployeeNumberWithoutZeros,
            UseOnbehalfBackendSearch: this.useOnbehalfBackendSearch,
        };
    }
}
