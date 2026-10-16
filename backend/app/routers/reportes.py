from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles
from app.db.database import get_db
from app.models.usuario import Usuario
from app.services import reporte_service

router = APIRouter(prefix="/api/v1/reportes", tags=["reportes"])


@router.get("/{tipo_informe}", response_model=Any)
def obtener_reporte(
    tipo_informe: str,
    desde: str | None = Query(default=None),
    hasta: str | None = Query(default=None),
    db: Session = Depends(get_db),
    admin: Usuario = Depends(requiere_roles("Administrador", "administrador")),
):
    for nombre, valor in (("desde", desde), ("hasta", hasta)):
        if valor:
            try:
                datetime.fromisoformat(valor)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Parámetro '{nombre}' inválido. Use formato ISO (AAAA-MM-DD)",
                )

    if tipo_informe == "por_agente":
        return reporte_service.reporte_por_agente(db, desde, hasta)
    elif tipo_informe == "por_prioridad":
        return reporte_service.reporte_por_prioridad(db, desde, hasta)
    elif tipo_informe == "tiempos_resolucion":
        return reporte_service.reporte_tiempos_resolucion(db, desde, hasta)
    elif tipo_informe == "estado_general":
        return reporte_service.reporte_estado_general(db, desde, hasta)
    elif tipo_informe == "incidencias_area_categoria":
        return reporte_service.reporte_incidencias_area_categoria(db, desde, hasta)
    else:
        raise HTTPException(
            status_code=400,
            detail="Tipo de informe no válido. Opciones: por_agente, por_prioridad, tiempos_resolucion, estado_general, incidencias_area_categoria",
        )
