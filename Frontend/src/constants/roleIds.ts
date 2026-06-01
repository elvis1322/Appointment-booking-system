/** GUID-et e roleve (sipas `AppDefaults.Roles` në backend) */
export const ROLE_IDS = {

    Employee: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e',
    Client: 'b1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5f',
     Admin: 'd1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
} as const;

export const ROLE_OPTIONS = [

    { id: ROLE_IDS.Employee, label: 'Employee' },
    { id: ROLE_IDS.Client, label: 'Client' },
      { id: ROLE_IDS.Admin, label: 'Admin ' },
];
