export interface PendingReservation {
    idReserva: string;
    codigoReserva: string;
    idSede: string;
    fechaCreacion: string;
    factura: {
        id: string;
        numeroDocumento: string;
        razonSocial: string;
        direccion: string;
    } | null;                 
    nombreSede: string;
    detalleReservas: {
        idDetalleReserva: string;
        fecha: string;          
        horaInicio: string;   
        horaFin: string;       
        precio: string;        
        campo: {
            idCampo: string;
            nombre: string;
        };
    }[];
}
