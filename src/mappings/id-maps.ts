// src/mappings/id-maps.ts
export const mapSales: { [key: number]: string } = {
    42: '9db60b83-8dd0-4686-81b1-0bb267cf73e1',
    // etc.
};

export const mapLocales: Record<number, string> = {
    1: 'c5f7d4e6-3333-4444-5555-666677778811', // LOCAL TEST
};

export const mapDocumentTypes: Record<number, string> = {
    1: '5d5c1e11-8c2b-4a0a-8d22-1c60d1d3fef1', // FACTURA
    2: '97c74944-3c3e-4701-8a8d-19bdff4a1f01', // BOLETA
};

export const mapPaymentTypes: Record<number, string> = {
    1: 'b8d8eaa6-1c2e-4d6d-911e-3ea29efcddf2', // CONTADO
    2: 'a9c2f4d6-8e3b-4fa2-b991-80cfcb8dbb77', // CRÉDITO
};

export const mapCashRegisters: Record<number, string> = {
    25061201: 'd1e1f1a1-aaaa-bbbb-cccc-111122223333',
    25061202: 'd2e2f2a2-aaaa-bbbb-cccc-444455556666',
    25061203: 'd3e3f3a3-aaaa-bbbb-cccc-777788889999',
    25061204: 'd4e4f4a4-aaaa-bbbb-cccc-000011112222',
    25061205: 'd5e5f5a5-aaaa-bbbb-cccc-333344445555',
    25062601: 'd6e6f6a6-aaaa-bbbb-cccc-666677778888',
};
export const mapClients: Record<number, string> = {
    6: '07fe5661-8b7d-49d9-8e6b-ec409e8eb653', // María Gómez
    7: 'b6a1a133-7e58-421e-b7bb-10defabc0007', // Empresa ABC
    8: 'b6a1a133-7e58-421e-b7bb-10defabc0008', // Pedro
    9: 'b6a1a133-7e58-421e-b7bb-10defabc0009', // Corporación XYZ
    10: 'b6a1a133-7e58-421e-b7bb-10defabc0010', // José
    12: 'b6a1a133-7e58-421e-b7bb-10defabc0012', // ✅ Ignacio Bobadilla
    1: 'cc0b0e25-bdf1-41c3-b879-6d326fbab001', // CLIENTE VARIOS
};


export const mapUsers: Record<number, string> = {
    1: 'a3f1b2c4-1111-2222-3333-444455556666', // user1
    2: 'b4f2c3d5-2222-3333-4444-555566667777', // user2
    3: 'c5f3d4e6-3333-4444-5555-666677778888', // user3
};

export const mapSides: Record<number, string> = {
    1: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // lado 1
    2: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', // lado 2
    3: '33333333-cccc-cccc-cccc-cccccccccccc', // lado 3
    4: '44444444-dddd-dddd-dddd-dddddddddddd', // lado 4
    5: '55555555-eeee-eeee-eeee-eeeeeeeeeeee', // lado 5
    6: '66666666-ffff-ffff-ffff-ffffffffffff', // lado 6
    7: '77777777-aaaa-1111-bbbb-cccccccccccc', // lado 7
    8: '88888888-bbbb-2222-cccc-dddddddddddd', // lado 8
    9: '99999999-cccc-3333-dddd-eeeeeeeeeeee', // lado 9
    10: '10101010-dddd-4444-eeee-ffffffffffff', // lado 10
    11: '12121212-eeee-5555-ffff-aaaaaaaaaaaa', // lado 11
    12: '13131313-ffff-6666-aaaa-bbbbbbbbbbbb', // lado 12
};

export const mapTransactions: Record<number, string> = {
    1: '6d5fbe9b-12f3-4312-993f-69e30e8d2f4e',
    7: '7a9c3e22-aaaa-bbbb-cccc-1234567890ab', // ← agregado
    3: '6d5fbe9b-12f3-4312-993f-69e30e8d2f4e',
};