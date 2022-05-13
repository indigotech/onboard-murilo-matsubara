select id, name, email, "birthDate"
from public.user
where (name, id) >= (
    select name, id
    from public.user
    where id = $3
)
order by name, id asc
limit $1 offset $2