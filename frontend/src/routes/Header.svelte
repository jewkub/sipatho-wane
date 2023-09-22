<script lang="ts">
	import { page } from '$app/stores'
	import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
  } from 'sveltestrap'
	import routes from './hospitalList'
	// const routes: Record<string, string> = {
	// 	si: 'SI',
	// 	siph: 'SIPH',
	// 	'part-off': 'Part-time off',
	// 	frozen: 'Frozen',
	// 	'full-cyto': 'Full-time off cytology',
	// 	'full-autopsy': 'Full-time off autopsy',
	// }

	let isOpen = false

  const handleUpdate = (event: CustomEvent) => isOpen = event.detail.isOpen
</script>

<header>
	<Navbar color="body-tertiary" expand="xl">
		<NavbarBrand href="/">Home</NavbarBrand>
		<NavbarToggler on:click={() => (isOpen = !isOpen)} />
		<Collapse {isOpen} navbar expand="xl" on:update={handleUpdate}>
			<Nav class="ms-auto" navbar underline>
				{#each Object.keys(routes) as route (route)}
					<NavItem>
						<NavLink
							href={`/${route}`}
							aria-current={$page.url.pathname === `/${route}` ? 'page' : null}
							active={$page.url.pathname === `/${route}`}>
								{routes[route]}
						</NavLink>
					</NavItem>
				{/each}
			</Nav>
		</Collapse>
	</Navbar>
</header>
