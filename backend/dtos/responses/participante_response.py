from typing import Optional

from pydantic import BaseModel, Field

from model.participante_model import Participante


class ParticipanteResponse(BaseModel):
    """Representação de um participante (time) para o frontend."""

    id: int
    nome: str
    escudo_url: Optional[str] = None
    esporte: str
    ativo: bool = Field(..., description="Se o participante está ativo")

    @classmethod
    def de_participante(cls, p: Participante) -> "ParticipanteResponse":
        return cls(
            id=p.id,
            nome=p.nome,
            escudo_url=p.escudo_url,
            esporte=p.esporte,
            ativo=p.ativo,
        )